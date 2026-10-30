// Native media autoplay uses the browser's media playback permission on fresh loads.
// The original chiptune and its renderer live in scripts/generate-arcade-soundtrack.mjs.
export class ArcadeMusic {
    private audio?: HTMLAudioElement;
    private enabled = false;
    private disposed = false;

    constructor(
        private onPlaying: (playing: boolean) => void,
        private onFailure: (blocked: boolean) => void = () => {},
        private source = '/delfoter-arcade/arcade-theme.wav'
    ) {}

    async setEnabled(enabled: boolean) {
        if (this.disposed) return;
        this.enabled = enabled;
        if (!enabled) {
            if (this.audio) {
                this.audio.autoplay = false;
                this.audio.pause();
            }
            this.onPlaying(false);
            return;
        }
        if (!this.audio) {
            this.audio = new Audio(this.source);
            this.audio.loop = true;
            this.audio.autoplay = true;
            this.audio.preload = 'auto';
            this.audio.volume = 0.35;
            this.audio.addEventListener('playing', this.onStarted);
            this.audio.addEventListener('pause', this.onStopped);
            this.audio.addEventListener('error', this.onError);
        }
        this.audio.autoplay = true;
        try {
            await this.audio.play();
            if (!this.disposed && this.enabled) this.onStarted();
        } catch (error) {
            // Ignore a pending play cancelled by mute, visibility, or StrictMode cleanup.
            if (this.disposed || !this.enabled) return;
            if (error instanceof DOMException && error.name === 'AbortError')
                return;
            this.onPlaying(false);
            this.onFailure(
                error instanceof DOMException &&
                    error.name === 'NotAllowedError'
            );
        }
    }

    private onStarted = () => {
        if (this.disposed || !this.enabled) {
            this.audio?.pause();
            return;
        }
        this.onPlaying(true);
    };
    private onStopped = () => {
        if (!this.disposed) this.onPlaying(false);
    };
    private onError = () => {
        if (this.disposed) return;
        this.onPlaying(false);
        this.onFailure(false);
    };

    dispose() {
        this.disposed = true;
        this.enabled = false;
        if (!this.audio) return;
        this.audio.removeEventListener('playing', this.onStarted);
        this.audio.removeEventListener('pause', this.onStopped);
        this.audio.removeEventListener('error', this.onError);
        this.audio.pause();
        this.audio.removeAttribute('src');
        this.audio.load();
    }
}
