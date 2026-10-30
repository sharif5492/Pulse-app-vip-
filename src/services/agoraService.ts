import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
  UID,
} from 'agora-rtc-sdk-ng';

// Silence verbose Agora debug logs in console
AgoraRTC.setLogLevel(2); // 2: WARNING

export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || 'e28d29dbdf2f46718ba508b883885690';

export interface AgoraVolumeInfo {
  uid: UID;
  level: number;
}

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private currentChannel: string | null = null;
  private isJoined = false;

  // Event handlers
  private onUserPublishedCallback?: (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video' | 'datachannel') => void;
  private onUserUnpublishedCallback?: (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video' | 'datachannel') => void;
  private onVolumeIndicatorCallback?: (volumes: AgoraVolumeInfo[]) => void;

  public getAppId(): string {
    return AGORA_APP_ID;
  }

  public isConfigured(): boolean {
    return Boolean(AGORA_APP_ID && AGORA_APP_ID.length >= 20);
  }

  /**
   * Initialize and join an Agora channel for 1-to-1 Calling, Party Voice Rooms, or Live Stream
   */
  public async joinChannel(options: {
    channel: string;
    mode?: 'rtc' | 'live';
    role?: 'host' | 'audience';
    uid?: UID;
    token?: string | null;
  }): Promise<{ success: boolean; uid?: UID; error?: string }> {
    try {
      if (!this.isConfigured()) {
        console.warn('[Agora] App ID is missing or invalid');
        return { success: false, error: 'Agora App ID not configured' };
      }

      // Cleanup any previous session
      await this.leaveChannel();

      const mode = options.mode || 'rtc';
      this.client = AgoraRTC.createClient({ mode, codec: 'vp8' });

      if (mode === 'live') {
        await this.client.setClientRole(options.role || 'host');
      }

      // Setup event listeners
      this.client.on('user-published', async (user, mediaType) => {
        try {
          await this.client?.subscribe(user, mediaType);
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
          this.onUserPublishedCallback?.(user, mediaType);
        } catch (err) {
          console.warn('[Agora] Failed to subscribe to remote user:', err);
        }
      });

      this.client.on('user-unpublished', (user, mediaType) => {
        this.onUserUnpublishedCallback?.(user, mediaType);
      });

      // Enable volume indicator (measures speaking volume every 200ms)
      this.client.enableAudioVolumeIndicator();
      this.client.on('volume-indicator', (volumes) => {
        this.onVolumeIndicatorCallback?.(
          volumes.map((v) => ({ uid: v.uid, level: v.level }))
        );
      });

      // Join channel
      const joinedUid = await this.client.join(
        AGORA_APP_ID,
        options.channel,
        options.token || null,
        options.uid || null
      );

      this.currentChannel = options.channel;
      this.isJoined = true;
      console.log(`[Agora] Successfully joined channel ${options.channel} as UID ${joinedUid}`);

      return { success: true, uid: joinedUid };
    } catch (err: unknown) {
      console.warn('[Agora] joinChannel error, using graceful fallback:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Publish local Microphone audio track
   */
  public async publishMicrophone(): Promise<IMicrophoneAudioTrack | null> {
    try {
      if (!this.client || !this.isJoined) return null;

      if (!this.localAudioTrack) {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true, // Acoustic Echo Cancellation
          ANS: true, // Automatic Noise Suppression
        });
      }

      await this.client.publish([this.localAudioTrack]);
      console.log('[Agora] Microphone track published');
      return this.localAudioTrack;
    } catch (err) {
      console.warn('[Agora] publishMicrophone error:', err);
      return null;
    }
  }

  /**
   * Publish local Camera video track
   */
  public async publishCamera(isFrontCamera = true): Promise<ICameraVideoTrack | null> {
    try {
      if (!this.client || !this.isJoined) return null;

      if (!this.localVideoTrack) {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
          facingMode: isFrontCamera ? 'user' : 'environment',
          encoderConfig: '720p_1',
        });
      }

      await this.client.publish([this.localVideoTrack]);
      console.log('[Agora] Camera track published');
      return this.localVideoTrack;
    } catch (err) {
      console.warn('[Agora] publishCamera error:', err);
      return null;
    }
  }

  /**
   * Mute or Unmute local mic
   */
  public async setMute(muted: boolean): Promise<void> {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(!muted);
    }
  }

  /**
   * Enable or Disable local camera
   */
  public async setVideoEnabled(enabled: boolean): Promise<void> {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(enabled);
    }
  }

  /**
   * Flip between front and rear camera
   */
  public async switchCamera(deviceId?: string): Promise<void> {
    if (this.localVideoTrack && deviceId) {
      await this.localVideoTrack.setDevice(deviceId);
    }
  }

  /**
   * Listen to remote user media published
   */
  public onUserPublished(callback: (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video' | 'datachannel') => void) {
    this.onUserPublishedCallback = callback;
  }

  /**
   * Listen to remote user media unpublished
   */
  public onUserUnpublished(callback: (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video' | 'datachannel') => void) {
    this.onUserUnpublishedCallback = callback;
  }

  /**
   * Listen to audio volume levels of speakers
   */
  public onVolumeIndicator(callback: (volumes: AgoraVolumeInfo[]) => void) {
    this.onVolumeIndicatorCallback = callback;
  }

  /**
   * Leave the current Agora channel and release tracks
   */
  public async leaveChannel(): Promise<void> {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }
      if (this.client) {
        await this.client.leave();
        this.client.removeAllListeners();
        this.client = null;
      }
      this.isJoined = false;
      this.currentChannel = null;
      console.log('[Agora] Left channel and cleared tracks');
    } catch (err) {
      console.warn('[Agora] leaveChannel error:', err);
    }
  }

  /**
   * Apply Agora Live Beauty Effect (Skin smoothing, brightening, rosy tone)
   */
  public async setBeautyEffect(enabled: boolean, options?: {
    lighteningContrastLevel?: 0 | 1 | 2;
    lighteningLevel?: number;
    smoothnessLevel?: number;
    rednessLevel?: number;
  }): Promise<boolean> {
    try {
      if (this.localVideoTrack && typeof (this.localVideoTrack as any).setBeautyEffect === 'function') {
        await (this.localVideoTrack as any).setBeautyEffect(enabled, options || {
          lighteningContrastLevel: 1,
          lighteningLevel: 0.7,
          smoothnessLevel: 0.8,
          rednessLevel: 0.5,
        });
        console.log(`[Agora Beauty] Filter enabled: ${enabled}`);
        return true;
      }
    } catch (err) {
      console.warn('[Agora] setBeautyEffect warning (using software filter fallback):', err);
    }
    return false;
  }

  public getLocalVideoTrack(): ICameraVideoTrack | null {
    return this.localVideoTrack;
  }

  public getLocalAudioTrack(): IMicrophoneAudioTrack | null {
    return this.localAudioTrack;
  }
}

export const agoraService = new AgoraService();
