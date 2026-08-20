
/*!
 * Webflow: Front-end site library
 * @license MIT
 * Inline scripts may access the api using an async handler:
 *   var Webflow = Webflow || [];
 *   Webflow.push(readyFunction);
 */

"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["520"], {
5897: (function (__unused_webpack_module, exports, __webpack_require__) {
/* eslint-env browser */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    cleanupElement: function() {
        return cleanupElement;
    },
    createInstance: function() {
        return createInstance;
    },
    destroy: function() {
        return destroy;
    },
    init: function() {
        return init;
    },
    ready: function() {
        return ready;
    }
});
const _LottieFetchUtils = __webpack_require__(7933);
const loadAnimation = (win, params)=>win.Webflow.require('lottie')?.lottie.loadAnimation(params);
const isInDesigner = (win)=>Boolean(win.Webflow.env('design') || win.Webflow.env('preview'));
const PlayerState = {
    Playing: 'playing',
    Stopped: 'stopped'
};
class Cache {
    _cache = [];
    set(container, instance) {
        const index = this._cache.findIndex(({ wrapper })=>wrapper === container);
        if (index !== -1) this._cache.splice(index, 1);
        this._cache.push({
            wrapper: container,
            instance
        });
    }
    delete(container) {
        const index = this._cache.findIndex(({ wrapper })=>wrapper === container);
        if (index !== -1) this._cache.splice(index, 1);
    }
    get(container) {
        const index = this._cache.findIndex(({ wrapper })=>wrapper === container);
        if (index === -1) return null;
        return this._cache[index]?.instance ?? null;
    }
}
const cache = new Cache();
const emptyDataset = {};
const parseNumber = (value)=>{
    if (typeof value !== 'string') return NaN;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? NaN : parsed;
};
class LottieInstance {
    config = null;
    currentState = PlayerState.Stopped;
    animationItem = null;
    _gsapFrame = null;
    _isOffscreen = false;
    _wasPlayingBeforePause = false;
    _pendingAutoplay = false;
    // Tracks the latest frame value requested while offscreen. IX2/IX3
    // scrub Lottie frames via goToFrame / goToFrameAndStop (lottie-web's
    // rAF stays paused); those calls no-op while offscreen and we replay
    // the last value on re-entry so the visual state is correct.
    _skippedFrame = null;
    handlers = {
        enterFrame: [],
        complete: [],
        loop: [],
        dataReady: [],
        destroy: [],
        error: []
    };
    load(container) {
        const dataset = container.dataset || emptyDataset;
        const src = dataset.src || '';
        if (src.endsWith('.lottie')) {
            (0, _LottieFetchUtils.fetchLottie)(src).then((animationData)=>{
                this._loadAnimation(container, animationData);
            });
        } else {
            this._loadAnimation(container, undefined);
        }
        cache.set(container, this);
        this.container = container;
    }
    _loadAnimation(container, animationData) {
        const dataset = container.dataset || emptyDataset;
        const src = dataset.src || '';
        const preserveAspectRatio = dataset.preserveAspectRatio || 'xMidYMid meet'; // Available options here https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
        const renderer = dataset.renderer || 'svg';
        const loop = parseNumber(dataset.loop) === 1;
        const directionNumber = parseNumber(dataset.direction);
        const direction = directionNumber === -1 ? -1 : 1;
        const hasWfTarget = Boolean(dataset.wfTarget);
        const autoplay = hasWfTarget ? false : parseNumber(dataset.autoplay) === 1;
        const durationNumber = parseNumber(dataset.duration);
        const duration = Number.isNaN(durationNumber) ? 0 : durationNumber;
        const hasIx2 = hasWfTarget || parseNumber(dataset.isIx2Target) === 1;
        const rawIx2InitialValue = parseNumber(dataset.ix2InitialState);
        const ix2InitialValue = Number.isNaN(rawIx2InitialValue) ? null : rawIx2InitialValue;
        const config = {
            src,
            loop,
            autoplay,
            renderer,
            direction,
            duration,
            hasIx2,
            ix2InitialValue,
            preserveAspectRatio
        };
        // If it's the same path/src, don't destroy the animation
        if (this.animationItem && this.config && this.config.src === src && renderer === this.config.renderer && preserveAspectRatio === this.config.preserveAspectRatio) {
            if (loop !== this.config.loop) {
                this.setLooping(loop);
            }
            if (!hasIx2) {
                if (direction !== this.config.direction) {
                    this.setDirection(direction);
                }
                if (duration !== this.config.duration) {
                    const currentDuration = this.duration;
                    if (duration > 0 && duration !== currentDuration) {
                        this.setSpeed(currentDuration / duration);
                    } else {
                        this.setSpeed(1);
                    }
                }
            }
            if (autoplay) {
                if (this._isOffscreen) {
                    this._pendingAutoplay = true;
                } else {
                    this.play();
                }
            }
            if (ix2InitialValue != null && ix2InitialValue !== this.config.ix2InitialValue) {
                const percent = ix2InitialValue / 100;
                this.goToFrame(this.frames * percent);
            }
            this.config = config;
            return;
        }
        const options = {
            container,
            loop,
            autoplay,
            renderer,
            rendererSettings: {
                preserveAspectRatio,
                progressiveLoad: true,
                hideOnTransparent: true
            }
        };
        const win = container.ownerDocument.defaultView;
        try {
            // Clear previous animation, if any
            if (this.animationItem) {
                this.destroy();
            }
            // Initialize lottie player and load animation
            this.animationItem = loadAnimation(win, {
                ...options,
                ...animationData ? {
                    animationData
                } : {
                    path: src
                }
            });
        } catch (err) {
            this.handlers.error.forEach((cb)=>cb());
            return;
        }
        if (!this.animationItem) return;
        if (isInDesigner(win)) {
            // Calculate and save the current progress of the animation
            this.animationItem.addEventListener('enterFrame', ()=>{
                if (!this.animationItem || !this.isPlaying) return;
                const { currentFrame, totalFrames, playDirection } = this.animationItem;
                const toPercent = currentFrame / totalFrames * 100;
                const percentage = Math.round(playDirection === 1 ? toPercent : 100 - toPercent);
                this.handlers.enterFrame.forEach((cb)=>cb(percentage, currentFrame));
            });
            // Handle animation play complete
            this.animationItem.addEventListener('complete', ()=>{
                if (!this.animationItem) return;
                if (this.currentState !== PlayerState.Playing) {
                    this.handlers.complete.forEach((cb)=>cb());
                    return;
                }
                if (!this.animationItem.loop) {
                    this.handlers.complete.forEach((cb)=>cb());
                    return;
                }
                this.currentState = PlayerState.Stopped;
            });
            // Handle animation play complete
            this.animationItem.addEventListener('loopComplete', (loopComplete)=>{
                this.handlers.loop.forEach((cb)=>cb(loopComplete));
            });
            // Set error state when animation load fail event triggers
            this.animationItem.addEventListener('data_failed', ()=>{
                this.handlers.error.forEach((cb)=>cb());
            });
            // Set error state when animation load fail event triggers
            this.animationItem.addEventListener('error', ()=>{
                this.handlers.error.forEach((cb)=>cb());
            });
        }
        if (this.isLoaded) {
            this.handlers.dataReady.forEach((cb)=>cb());
            if (autoplay) {
                if (this._isOffscreen) {
                    this._pendingAutoplay = true;
                } else {
                    this.play();
                }
            }
        } else {
            // Handle animation data load complete
            this.animationItem.addEventListener('data_ready', ()=>{
                this.handlers.dataReady.forEach((cb)=>cb());
                // Only set the direction and speed if no IX2 is attached
                if (!hasIx2) {
                    this.setDirection(direction);
                    const currentDuration = this.duration;
                    if (duration > 0 && duration !== currentDuration) {
                        this.setSpeed(currentDuration / duration);
                    }
                    if (autoplay) {
                        if (this._isOffscreen) {
                            this._pendingAutoplay = true;
                        } else {
                            this.play();
                        }
                    }
                }
                // Set the animation's initial state value from IX2
                if (ix2InitialValue != null) {
                    const percent = ix2InitialValue / 100;
                    this.goToFrame(this.frames * percent);
                }
            });
        }
        this.config = config;
    }
    onFrameChange(cb) {
        if (this.handlers.enterFrame.indexOf(cb) === -1) {
            this.handlers.enterFrame.push(cb);
        }
    }
    onPlaybackComplete(cb) {
        if (this.handlers.complete.indexOf(cb) === -1) {
            this.handlers.complete.push(cb);
        }
    }
    onLoopComplete(cb) {
        if (this.handlers.loop.indexOf(cb) === -1) {
            this.handlers.loop.push(cb);
        }
    }
    onDestroy(cb) {
        if (this.handlers.destroy.indexOf(cb) === -1) {
            this.handlers.destroy.push(cb);
        }
    }
    onDataReady(cb) {
        if (this.handlers.dataReady.indexOf(cb) === -1) {
            this.handlers.dataReady.push(cb);
        }
    }
    onError(cb) {
        if (this.handlers.error.indexOf(cb) === -1) {
            this.handlers.error.push(cb);
        }
    }
    play() {
        if (!this.animationItem) return;
        const frame = this.animationItem.playDirection === 1 ? 0 : this.frames;
        this.animationItem.goToAndPlay(frame, true);
        this.currentState = PlayerState.Playing;
    }
    stop() {
        if (!this.animationItem) return;
        if (this.isPlaying) {
            const { playDirection } = this.animationItem;
            const frame = playDirection === 1 ? 0 : this.frames;
            this.animationItem.goToAndStop(frame, true);
        }
        this.currentState = PlayerState.Stopped;
    }
    // Resume decision is driven by `isPlaying` at the moment of pause:
    // - Continuous autoplay+loop: was playing → resumes on re-entry.
    // - Play-once, finished: was not playing → stays stopped.
    // - Play-once, mid-play: was playing → resumes from its paused frame.
    // - IX2/IX3-driven: lottie-web's rAF isn't running (IX drives frames
    //   via setCurrentRawFrameValue / goToAndStop), so `isPlaying` is
    //   false and we leave control to the interaction system.
    pauseByVisibility() {
        this._isOffscreen = true;
        if (!this.animationItem) return;
        this._wasPlayingBeforePause = this.isPlaying;
        if (this.isPlaying) {
            this.animationItem.pause();
        }
    }
    resumeByVisibility() {
        this._isOffscreen = false;
        if (!this.animationItem) return;
        // IX-driven animations scrub frames via goToFrame / goToFrameAndStop
        // while we were offscreen; those calls no-op'd. Replay the latest
        // requested frame so the element reflects its current state.
        if (this._skippedFrame != null) {
            this.animationItem.goToAndStop(this._skippedFrame, true);
            this._skippedFrame = null;
        }
        if (this._wasPlayingBeforePause) {
            this._wasPlayingBeforePause = false;
            this.animationItem.play();
            return;
        }
        // Eager + offscreen + autoplay edge case: data loaded while the
        // element was offscreen, so the autoplay path deferred playback.
        // Fire it now that the element is visible.
        if (this._pendingAutoplay) {
            this._pendingAutoplay = false;
            this.play();
        }
    }
    destroy() {
        if (!this.animationItem) return;
        if (this.isPlaying) this.stop();
        this.handlers.destroy.forEach((cb)=>cb());
        if (this.container) {
            cache.delete(this.container);
        }
        this.animationItem.destroy();
        Object.values(this.handlers).forEach((handler)=>{
            handler.length = 0;
        });
        this._isOffscreen = false;
        this._wasPlayingBeforePause = false;
        this._pendingAutoplay = false;
        this._skippedFrame = null;
        this.animationItem = null;
        this.container = null;
        this.config = null;
    }
    get gsapFrame() {
        return this._gsapFrame;
    }
    set gsapFrame(value) {
        this._gsapFrame = value;
        if (value == null) return;
        this.goToFrameAndStop(value);
    }
    get isPlaying() {
        if (!this.animationItem) return false;
        return !this.animationItem.isPaused;
    }
    get isPaused() {
        if (!this.animationItem) return false;
        return this.animationItem.isPaused;
    }
    get duration() {
        if (!this.animationItem) return 0;
        return this.animationItem.getDuration();
    }
    get frames() {
        if (!this.animationItem) return 0;
        return this.animationItem.totalFrames;
    }
    get direction() {
        if (!this.animationItem) return 1;
        return this.animationItem.playDirection === 1 ? 1 : -1;
    }
    get isLoaded() {
        if (!this.animationItem) return false;
        return this.animationItem.isLoaded;
    }
    get ix2InitialValue() {
        return this.config ? this.config.ix2InitialValue : null;
    }
    goToFrame(value) {
        if (!this.animationItem) return;
        if (this._isOffscreen) {
            this._skippedFrame = value;
            return;
        }
        this.animationItem.setCurrentRawFrameValue(value);
    }
    goToFrameAndStop(value) {
        if (!this.animationItem) return;
        if (this._isOffscreen) {
            this._skippedFrame = value;
            return;
        }
        this.animationItem.goToAndStop(value, true);
    }
    setSubframe(value) {
        if (!this.animationItem) return;
        this.animationItem.setSubframe(value);
    }
    setSpeed(value = 1) {
        if (!this.animationItem) return;
        if (this.isPlaying) this.stop();
        this.animationItem.setSpeed(value);
    }
    setLooping(value) {
        if (!this.animationItem) return;
        if (this.isPlaying) this.stop();
        this.animationItem.loop = value;
    }
    setDirection(value) {
        if (!this.animationItem) return;
        if (this.isPlaying) this.stop();
        this.animationItem.setDirection(value);
        this.goToFrame(value === 1 ? 0 : this.frames);
    }
}
// rootMargin is expressed as a percentage of the viewport height so it
// scales with the user's actual display. A fixed pixel value (e.g. 1250px)
// is smaller than one viewport on 5K+ monitors, which defeats the point
// of preloading before the element enters view.
function getLazyLoadRootMargin() {
    const connection = navigator.connection;
    if (connection?.effectiveType) {
        switch(connection.effectiveType){
            case 'slow-2g':
            case '2g':
                return '300% 0%';
            case '3g':
                return '250% 0%';
            case '4g':
            default:
                return '150% 0%';
        }
    }
    return '150% 0%';
}
let lazyLoadObserver = null;
let visibilityObserver = null;
const getLottieElements = ()=>Array.from(document.querySelectorAll('[data-animation-type="lottie"]'));
const hasIx = (element)=>{
    const dataset = element.dataset;
    const hasWfTarget = Boolean(dataset.wfTarget);
    const isIx2Target = parseNumber(dataset.isIx2Target) === 1;
    return hasWfTarget || isIx2Target;
};
const isEagerLoading = (element)=>{
    const loading = element.dataset.loading;
    return loading !== 'lazy';
};
const observeVisibility = (element)=>{
    if (typeof IntersectionObserver === 'undefined') return;
    getVisibilityObserver().observe(element);
};
function getVisibilityObserver() {
    if (!visibilityObserver) {
        visibilityObserver = new IntersectionObserver((entries)=>{
            entries.forEach((entry)=>{
                const element = entry.target;
                const instance = cache.get(element);
                if (!instance) return;
                if (entry.isIntersecting) {
                    instance.resumeByVisibility();
                } else {
                    instance.pauseByVisibility();
                }
            });
        });
    }
    return visibilityObserver;
}
function getLazyLoadObserver() {
    if (!lazyLoadObserver) {
        lazyLoadObserver = new IntersectionObserver((entries)=>{
            entries.forEach((entry)=>{
                if (!entry.isIntersecting) return;
                const element = entry.target;
                lazyLoadObserver?.unobserve(element);
                if (!hasIx(element)) cleanupElement(element);
                createInstance(element);
            });
        }, {
            rootMargin: getLazyLoadRootMargin()
        });
    }
    return lazyLoadObserver;
}
const createInstance = (container)=>{
    let lottieInstance = cache.get(container);
    if (lottieInstance == null) {
        lottieInstance = new LottieInstance();
    }
    lottieInstance.load(container);
    // Every Lottie instance (Designer, Canvas, IX plugins, published site)
    // flows through here, so visibility observation is wired up centrally —
    // init()'s eager path and the lazy-load callback don't need to call this
    // themselves.
    observeVisibility(container);
    return lottieInstance;
};
const cleanupElement = (element)=>{
    const lottieInstance = cache.get(element);
    if (lottieInstance) {
        lottieInstance.destroy();
    }
};
const init = ()=>{
    getLottieElements().forEach((element)=>{
        if (isEagerLoading(element) || typeof IntersectionObserver === 'undefined') {
            if (!hasIx(element)) cleanupElement(element);
            createInstance(element);
        } else {
            getLazyLoadObserver().observe(element);
        }
    });
};
const destroy = ()=>{
    getLottieElements().forEach(cleanupElement);
    if (lazyLoadObserver) {
        lazyLoadObserver.disconnect();
        lazyLoadObserver = null;
    }
    if (visibilityObserver) {
        visibilityObserver.disconnect();
        visibilityObserver = null;
    }
};
const ready = init;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9yZW5kZXIvcGx1Z2lucy9BbmltYXRpb24vbW9kdWxlcy9Mb3R0aWVTaXRlTW9kdWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIExvdHRpZVBsYXllcixcbiAgQW5pbWF0aW9uSXRlbSBhcyBfQW5pbWF0aW9uSXRlbSxcbiAgUmVuZGVyZXJUeXBlLFxuICBBbmltYXRpb25Db25maWdXaXRoUGF0aCxcbiAgQW5pbWF0aW9uQ29uZmlnV2l0aERhdGEsXG59IGZyb20gJ2xvdHRpZS13ZWInO1xuXG5pbXBvcnQgdHlwZSB7XG4gIExvdHRpZUl0ZW0sXG4gIE9uRnJhbWVDaGFuZ2VDYWxsYmFjayxcbiAgT25Mb29wQ29tcGxldGVDYWxsYmFjayxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7ZmV0Y2hMb3R0aWV9IGZyb20gJ0BwYWNrYWdlcy9zeXN0ZW1zL2NvcmUvdXRpbHMvTG90dGllRmV0Y2hVdGlscyc7XG5cbmludGVyZmFjZSBBbmltYXRpb25JdGVtIGV4dGVuZHMgX0FuaW1hdGlvbkl0ZW0ge1xuICBzZXRDdXJyZW50UmF3RnJhbWVWYWx1ZSh2YWx1ZTogbnVtYmVyKTogdm9pZDtcbn1cblxuY29uc3QgbG9hZEFuaW1hdGlvbiA9IDxUIGV4dGVuZHMgUmVuZGVyZXJUeXBlID0gJ3N2Zyc+KFxuICB3aW46IFdpbmRvdyxcbiAgcGFyYW1zOiBBbmltYXRpb25Db25maWdXaXRoUGF0aDxUPiB8IEFuaW1hdGlvbkNvbmZpZ1dpdGhEYXRhPFQ+XG4pOiBBbmltYXRpb25JdGVtIHwgbnVsbCA9PlxuICB3aW4uV2ViZmxvdy5yZXF1aXJlKCdsb3R0aWUnKT8ubG90dGllLmxvYWRBbmltYXRpb24oXG4gICAgcGFyYW1zXG4gICkgYXMgdW5rbm93biBhcyBBbmltYXRpb25JdGVtIHwgbnVsbDtcblxuY29uc3QgaXNJbkRlc2lnbmVyID0gKHdpbjogV2luZG93KSA9PlxuICBCb29sZWFuKHdpbi5XZWJmbG93LmVudignZGVzaWduJykgfHwgd2luLldlYmZsb3cuZW52KCdwcmV2aWV3JykpO1xuXG5jb25zdCBQbGF5ZXJTdGF0ZSA9IHtcbiAgUGxheWluZzogJ3BsYXlpbmcnIGFzIGNvbnN0LFxuICBTdG9wcGVkOiAnc3RvcHBlZCcgYXMgY29uc3QsXG59IGFzIGNvbnN0O1xuXG50eXBlIExvYWRBbmltYXRpb24gPSB7XG4gIHNyYzogc3RyaW5nO1xuICBsb29wOiBib29sZWFuO1xuICBhdXRvcGxheTogYm9vbGVhbjtcbiAgcmVuZGVyZXI6ICdzdmcnIHwgJ2NhbnZhcyc7XG4gIGRpcmVjdGlvbjogMSB8IC0xO1xuICBkdXJhdGlvbjogbnVtYmVyO1xuICBoYXNJeDI6IGJvb2xlYW47XG4gIGl4MkluaXRpYWxWYWx1ZTogbnVsbCB8IG51bWJlcjtcbiAgcHJlc2VydmVBc3BlY3RSYXRpbzogc3RyaW5nO1xufTtcblxuY2xhc3MgQ2FjaGUge1xuICBfY2FjaGU6IEFycmF5PHtcbiAgICB3cmFwcGVyOiBIVE1MRWxlbWVudDtcbiAgICBpbnN0YW5jZTogTG90dGllSW5zdGFuY2U7XG4gIH0+ID0gW107XG5cbiAgc2V0KGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGluc3RhbmNlOiBMb3R0aWVJbnN0YW5jZSk6IHZvaWQge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fY2FjaGUuZmluZEluZGV4KCh7d3JhcHBlcn0pID0+IHdyYXBwZXIgPT09IGNvbnRhaW5lcik7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkgdGhpcy5fY2FjaGUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLl9jYWNoZS5wdXNoKHt3cmFwcGVyOiBjb250YWluZXIsIGluc3RhbmNlfSk7XG4gIH1cblxuICBkZWxldGUoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fY2FjaGUuZmluZEluZGV4KCh7d3JhcHBlcn0pID0+IHdyYXBwZXIgPT09IGNvbnRhaW5lcik7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkgdGhpcy5fY2FjaGUuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxuXG4gIGdldChjb250YWluZXI6IEhUTUxFbGVtZW50KTogTG90dGllSW5zdGFuY2UgfCBudWxsIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuX2NhY2hlLmZpbmRJbmRleCgoe3dyYXBwZXJ9KSA9PiB3cmFwcGVyID09PSBjb250YWluZXIpO1xuICAgIGlmIChpbmRleCA9PT0gLTEpIHJldHVybiBudWxsO1xuICAgIHJldHVybiB0aGlzLl9jYWNoZVtpbmRleF0/Lmluc3RhbmNlID8/IG51bGw7XG4gIH1cbn1cblxuY29uc3QgY2FjaGUgPSBuZXcgQ2FjaGUoKTtcbmNvbnN0IGVtcHR5RGF0YXNldDogRE9NU3RyaW5nTWFwID0ge30gYXMgRE9NU3RyaW5nTWFwO1xuY29uc3QgcGFyc2VOdW1iZXIgPSAodmFsdWU/OiBzdHJpbmcgfCBudWxsKTogbnVtYmVyID0+IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBOYU47XG4gIGNvbnN0IHBhcnNlZCA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICByZXR1cm4gTnVtYmVyLmlzTmFOKHBhcnNlZCkgPyBOYU4gOiBwYXJzZWQ7XG59O1xuXG5jbGFzcyBMb3R0aWVJbnN0YW5jZSBpbXBsZW1lbnRzIExvdHRpZUl0ZW0ge1xuICBjb25maWc6IG51bGwgfCBMb2FkQW5pbWF0aW9uID0gbnVsbDtcbiAgZGVjbGFyZSBjb250YWluZXI6IG51bGwgfCBIVE1MRWxlbWVudDtcbiAgY3VycmVudFN0YXRlOiAodHlwZW9mIFBsYXllclN0YXRlKVtrZXlvZiB0eXBlb2YgUGxheWVyU3RhdGVdID1cbiAgICBQbGF5ZXJTdGF0ZS5TdG9wcGVkO1xuICBhbmltYXRpb25JdGVtOiBBbmltYXRpb25JdGVtIHwgbnVsbCA9IG51bGw7XG4gIF9nc2FwRnJhbWU6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICBfaXNPZmZzY3JlZW46IGJvb2xlYW4gPSBmYWxzZTtcbiAgX3dhc1BsYXlpbmdCZWZvcmVQYXVzZTogYm9vbGVhbiA9IGZhbHNlO1xuICBfcGVuZGluZ0F1dG9wbGF5OiBib29sZWFuID0gZmFsc2U7XG4gIC8vIFRyYWNrcyB0aGUgbGF0ZXN0IGZyYW1lIHZhbHVlIHJlcXVlc3RlZCB3aGlsZSBvZmZzY3JlZW4uIElYMi9JWDNcbiAgLy8gc2NydWIgTG90dGllIGZyYW1lcyB2aWEgZ29Ub0ZyYW1lIC8gZ29Ub0ZyYW1lQW5kU3RvcCAobG90dGllLXdlYidzXG4gIC8vIHJBRiBzdGF5cyBwYXVzZWQpOyB0aG9zZSBjYWxscyBuby1vcCB3aGlsZSBvZmZzY3JlZW4gYW5kIHdlIHJlcGxheVxuICAvLyB0aGUgbGFzdCB2YWx1ZSBvbiByZS1lbnRyeSBzbyB0aGUgdmlzdWFsIHN0YXRlIGlzIGNvcnJlY3QuXG4gIF9za2lwcGVkRnJhbWU6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIGhhbmRsZXJzOiB7XG4gICAgZW50ZXJGcmFtZTogQXJyYXk8T25GcmFtZUNoYW5nZUNhbGxiYWNrPjtcbiAgICBjb21wbGV0ZTogQXJyYXk8KCkgPT4gdm9pZD47XG4gICAgbG9vcDogQXJyYXk8T25Mb29wQ29tcGxldGVDYWxsYmFjaz47XG4gICAgZGF0YVJlYWR5OiBBcnJheTwoKSA9PiB2b2lkPjtcbiAgICBkZXN0cm95OiBBcnJheTwoKSA9PiB2b2lkPjtcbiAgICBlcnJvcjogQXJyYXk8KCkgPT4gdm9pZD47XG4gIH0gPSB7XG4gICAgZW50ZXJGcmFtZTogW10sXG4gICAgY29tcGxldGU6IFtdLFxuICAgIGxvb3A6IFtdLFxuICAgIGRhdGFSZWFkeTogW10sXG4gICAgZGVzdHJveTogW10sXG4gICAgZXJyb3I6IFtdLFxuICB9O1xuXG4gIGxvYWQoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGRhdGFzZXQgPSBjb250YWluZXIuZGF0YXNldCB8fCBlbXB0eURhdGFzZXQ7XG4gICAgY29uc3Qgc3JjID0gZGF0YXNldC5zcmMgfHwgJyc7XG5cbiAgICBpZiAoc3JjLmVuZHNXaXRoKCcubG90dGllJykpIHtcbiAgICAgIGZldGNoTG90dGllKHNyYykudGhlbigoYW5pbWF0aW9uRGF0YSkgPT4ge1xuICAgICAgICB0aGlzLl9sb2FkQW5pbWF0aW9uKGNvbnRhaW5lciwgYW5pbWF0aW9uRGF0YSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbG9hZEFuaW1hdGlvbihjb250YWluZXIsIHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIGNhY2hlLnNldChjb250YWluZXIsIHRoaXMpO1xuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICB9XG5cbiAgX2xvYWRBbmltYXRpb24oXG4gICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgICBhbmltYXRpb25EYXRhPzogUmVjb3JkPGFueSwgYW55PlxuICApOiB2b2lkIHtcbiAgICBjb25zdCBkYXRhc2V0ID0gY29udGFpbmVyLmRhdGFzZXQgfHwgZW1wdHlEYXRhc2V0O1xuICAgIGNvbnN0IHNyYyA9IGRhdGFzZXQuc3JjIHx8ICcnO1xuICAgIGNvbnN0IHByZXNlcnZlQXNwZWN0UmF0aW8gPSBkYXRhc2V0LnByZXNlcnZlQXNwZWN0UmF0aW8gfHwgJ3hNaWRZTWlkIG1lZXQnOyAvLyBBdmFpbGFibGUgb3B0aW9ucyBoZXJlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1NWRy9BdHRyaWJ1dGUvcHJlc2VydmVBc3BlY3RSYXRpb1xuICAgIGNvbnN0IHJlbmRlcmVyID0gKGRhdGFzZXQucmVuZGVyZXIgfHwgJ3N2ZycpIGFzICdzdmcnIHwgJ2NhbnZhcyc7XG4gICAgY29uc3QgbG9vcCA9IHBhcnNlTnVtYmVyKGRhdGFzZXQubG9vcCkgPT09IDE7XG4gICAgY29uc3QgZGlyZWN0aW9uTnVtYmVyID0gcGFyc2VOdW1iZXIoZGF0YXNldC5kaXJlY3Rpb24pO1xuICAgIGNvbnN0IGRpcmVjdGlvbjogMSB8IC0xID0gZGlyZWN0aW9uTnVtYmVyID09PSAtMSA/IC0xIDogMTtcbiAgICBjb25zdCBoYXNXZlRhcmdldCA9IEJvb2xlYW4oZGF0YXNldC53ZlRhcmdldCk7XG4gICAgY29uc3QgYXV0b3BsYXkgPSBoYXNXZlRhcmdldCA/IGZhbHNlIDogcGFyc2VOdW1iZXIoZGF0YXNldC5hdXRvcGxheSkgPT09IDE7XG4gICAgY29uc3QgZHVyYXRpb25OdW1iZXIgPSBwYXJzZU51bWJlcihkYXRhc2V0LmR1cmF0aW9uKTtcbiAgICBjb25zdCBkdXJhdGlvbiA9IE51bWJlci5pc05hTihkdXJhdGlvbk51bWJlcikgPyAwIDogZHVyYXRpb25OdW1iZXI7XG4gICAgY29uc3QgaGFzSXgyID0gaGFzV2ZUYXJnZXQgfHwgcGFyc2VOdW1iZXIoZGF0YXNldC5pc0l4MlRhcmdldCkgPT09IDE7XG4gICAgY29uc3QgcmF3SXgySW5pdGlhbFZhbHVlID0gcGFyc2VOdW1iZXIoZGF0YXNldC5peDJJbml0aWFsU3RhdGUpO1xuICAgIGNvbnN0IGl4MkluaXRpYWxWYWx1ZSA9IE51bWJlci5pc05hTihyYXdJeDJJbml0aWFsVmFsdWUpXG4gICAgICA/IG51bGxcbiAgICAgIDogcmF3SXgySW5pdGlhbFZhbHVlO1xuXG4gICAgY29uc3QgY29uZmlnOiBMb2FkQW5pbWF0aW9uID0ge1xuICAgICAgc3JjLFxuICAgICAgbG9vcCxcbiAgICAgIGF1dG9wbGF5LFxuICAgICAgcmVuZGVyZXIsXG4gICAgICBkaXJlY3Rpb24sXG4gICAgICBkdXJhdGlvbixcbiAgICAgIGhhc0l4MixcbiAgICAgIGl4MkluaXRpYWxWYWx1ZSxcbiAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW8sXG4gICAgfTtcblxuICAgIC8vIElmIGl0J3MgdGhlIHNhbWUgcGF0aC9zcmMsIGRvbid0IGRlc3Ryb3kgdGhlIGFuaW1hdGlvblxuICAgIGlmIChcbiAgICAgIHRoaXMuYW5pbWF0aW9uSXRlbSAmJlxuICAgICAgdGhpcy5jb25maWcgJiZcbiAgICAgIHRoaXMuY29uZmlnLnNyYyA9PT0gc3JjICYmXG4gICAgICByZW5kZXJlciA9PT0gdGhpcy5jb25maWcucmVuZGVyZXIgJiZcbiAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW8gPT09IHRoaXMuY29uZmlnLnByZXNlcnZlQXNwZWN0UmF0aW9cbiAgICApIHtcbiAgICAgIGlmIChsb29wICE9PSB0aGlzLmNvbmZpZy5sb29wKSB7XG4gICAgICAgIHRoaXMuc2V0TG9vcGluZyhsb29wKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFoYXNJeDIpIHtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiAhPT0gdGhpcy5jb25maWcuZGlyZWN0aW9uKSB7XG4gICAgICAgICAgdGhpcy5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkdXJhdGlvbiAhPT0gdGhpcy5jb25maWcuZHVyYXRpb24pIHtcbiAgICAgICAgICBjb25zdCBjdXJyZW50RHVyYXRpb24gPSB0aGlzLmR1cmF0aW9uO1xuICAgICAgICAgIGlmIChkdXJhdGlvbiA+IDAgJiYgZHVyYXRpb24gIT09IGN1cnJlbnREdXJhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5zZXRTcGVlZChjdXJyZW50RHVyYXRpb24gLyBkdXJhdGlvbik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3BlZWQoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChhdXRvcGxheSkge1xuICAgICAgICBpZiAodGhpcy5faXNPZmZzY3JlZW4pIHtcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nQXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgaXgySW5pdGlhbFZhbHVlICE9IG51bGwgJiZcbiAgICAgICAgaXgySW5pdGlhbFZhbHVlICE9PSB0aGlzLmNvbmZpZy5peDJJbml0aWFsVmFsdWVcbiAgICAgICkge1xuICAgICAgICBjb25zdCBwZXJjZW50ID0gaXgySW5pdGlhbFZhbHVlIC8gMTAwO1xuICAgICAgICB0aGlzLmdvVG9GcmFtZSh0aGlzLmZyYW1lcyAqIHBlcmNlbnQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgY29udGFpbmVyLFxuICAgICAgbG9vcCxcbiAgICAgIGF1dG9wbGF5LFxuICAgICAgcmVuZGVyZXIsXG4gICAgICByZW5kZXJlclNldHRpbmdzOiB7XG4gICAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW8sXG4gICAgICAgIHByb2dyZXNzaXZlTG9hZDogdHJ1ZSxcbiAgICAgICAgaGlkZU9uVHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICB9LFxuICAgIH0gYXMgY29uc3Q7XG4gICAgY29uc3Qgd2luID0gY29udGFpbmVyLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcgYXMgV2luZG93O1xuICAgIHRyeSB7XG4gICAgICAvLyBDbGVhciBwcmV2aW91cyBhbmltYXRpb24sIGlmIGFueVxuICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uSXRlbSkge1xuICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW5pdGlhbGl6ZSBsb3R0aWUgcGxheWVyIGFuZCBsb2FkIGFuaW1hdGlvblxuICAgICAgdGhpcy5hbmltYXRpb25JdGVtID0gbG9hZEFuaW1hdGlvbih3aW4sIHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgLi4uKGFuaW1hdGlvbkRhdGEgPyB7YW5pbWF0aW9uRGF0YX0gOiB7cGF0aDogc3JjfSksXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgdGhpcy5oYW5kbGVycy5lcnJvci5mb3JFYWNoKChjYikgPT4gY2IoKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbkl0ZW0pIHJldHVybjtcblxuICAgIGlmIChpc0luRGVzaWduZXIod2luKSkge1xuICAgICAgLy8gQ2FsY3VsYXRlIGFuZCBzYXZlIHRoZSBjdXJyZW50IHByb2dyZXNzIG9mIHRoZSBhbmltYXRpb25cbiAgICAgIHRoaXMuYW5pbWF0aW9uSXRlbS5hZGRFdmVudExpc3RlbmVyKCdlbnRlckZyYW1lJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbSB8fCAhdGhpcy5pc1BsYXlpbmcpIHJldHVybjtcblxuICAgICAgICBjb25zdCB7Y3VycmVudEZyYW1lLCB0b3RhbEZyYW1lcywgcGxheURpcmVjdGlvbn0gPSB0aGlzLmFuaW1hdGlvbkl0ZW07XG4gICAgICAgIGNvbnN0IHRvUGVyY2VudCA9IChjdXJyZW50RnJhbWUgLyB0b3RhbEZyYW1lcykgKiAxMDA7XG4gICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKFxuICAgICAgICAgIHBsYXlEaXJlY3Rpb24gPT09IDEgPyB0b1BlcmNlbnQgOiAxMDAgLSB0b1BlcmNlbnRcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmhhbmRsZXJzLmVudGVyRnJhbWUuZm9yRWFjaCgoY2IpID0+IGNiKHBlcmNlbnRhZ2UsIGN1cnJlbnRGcmFtZSkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEhhbmRsZSBhbmltYXRpb24gcGxheSBjb21wbGV0ZVxuICAgICAgdGhpcy5hbmltYXRpb25JdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbSkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50U3RhdGUgIT09IFBsYXllclN0YXRlLlBsYXlpbmcpIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZXJzLmNvbXBsZXRlLmZvckVhY2goKGNiKSA9PiBjYigpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbS5sb29wKSB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVycy5jb21wbGV0ZS5mb3JFYWNoKChjYikgPT4gY2IoKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudFN0YXRlID0gUGxheWVyU3RhdGUuU3RvcHBlZDtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBIYW5kbGUgYW5pbWF0aW9uIHBsYXkgY29tcGxldGVcbiAgICAgIHRoaXMuYW5pbWF0aW9uSXRlbS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAnbG9vcENvbXBsZXRlJyxcbiAgICAgICAgKGxvb3BDb21wbGV0ZToge2N1cnJlbnRMb29wOiBudW1iZXI7IHRvdGFsTG9vcHM6IG51bWJlciB8IGJvb2xlYW59KSA9PiB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVycy5sb29wLmZvckVhY2goKGNiKSA9PiBjYihsb29wQ29tcGxldGUpKTtcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgLy8gU2V0IGVycm9yIHN0YXRlIHdoZW4gYW5pbWF0aW9uIGxvYWQgZmFpbCBldmVudCB0cmlnZ2Vyc1xuICAgICAgdGhpcy5hbmltYXRpb25JdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2RhdGFfZmFpbGVkJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZXJzLmVycm9yLmZvckVhY2goKGNiKSA9PiBjYigpKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBTZXQgZXJyb3Igc3RhdGUgd2hlbiBhbmltYXRpb24gbG9hZCBmYWlsIGV2ZW50IHRyaWdnZXJzXG4gICAgICB0aGlzLmFuaW1hdGlvbkl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMuZXJyb3IuZm9yRWFjaCgoY2IpID0+IGNiKCkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNMb2FkZWQpIHtcbiAgICAgIHRoaXMuaGFuZGxlcnMuZGF0YVJlYWR5LmZvckVhY2goKGNiKSA9PiBjYigpKTtcblxuICAgICAgaWYgKGF1dG9wbGF5KSB7XG4gICAgICAgIGlmICh0aGlzLl9pc09mZnNjcmVlbikge1xuICAgICAgICAgIHRoaXMuX3BlbmRpbmdBdXRvcGxheSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSGFuZGxlIGFuaW1hdGlvbiBkYXRhIGxvYWQgY29tcGxldGVcbiAgICAgIHRoaXMuYW5pbWF0aW9uSXRlbS5hZGRFdmVudExpc3RlbmVyKCdkYXRhX3JlYWR5JywgKCkgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZXJzLmRhdGFSZWFkeS5mb3JFYWNoKChjYikgPT4gY2IoKSk7XG5cbiAgICAgICAgLy8gT25seSBzZXQgdGhlIGRpcmVjdGlvbiBhbmQgc3BlZWQgaWYgbm8gSVgyIGlzIGF0dGFjaGVkXG4gICAgICAgIGlmICghaGFzSXgyKSB7XG4gICAgICAgICAgdGhpcy5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKTtcblxuICAgICAgICAgIGNvbnN0IGN1cnJlbnREdXJhdGlvbiA9IHRoaXMuZHVyYXRpb247XG4gICAgICAgICAgaWYgKGR1cmF0aW9uID4gMCAmJiBkdXJhdGlvbiAhPT0gY3VycmVudER1cmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnNldFNwZWVkKGN1cnJlbnREdXJhdGlvbiAvIGR1cmF0aW9uKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYXV0b3BsYXkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc09mZnNjcmVlbikge1xuICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nQXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSBhbmltYXRpb24ncyBpbml0aWFsIHN0YXRlIHZhbHVlIGZyb20gSVgyXG4gICAgICAgIGlmIChpeDJJbml0aWFsVmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IHBlcmNlbnQgPSBpeDJJbml0aWFsVmFsdWUgLyAxMDA7XG4gICAgICAgICAgdGhpcy5nb1RvRnJhbWUodGhpcy5mcmFtZXMgKiBwZXJjZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBvbkZyYW1lQ2hhbmdlKGNiOiBPbkZyYW1lQ2hhbmdlQ2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5oYW5kbGVycy5lbnRlckZyYW1lLmluZGV4T2YoY2IpID09PSAtMSkge1xuICAgICAgdGhpcy5oYW5kbGVycy5lbnRlckZyYW1lLnB1c2goY2IpO1xuICAgIH1cbiAgfVxuXG4gIG9uUGxheWJhY2tDb21wbGV0ZShjYjogKCkgPT4gdm9pZCkge1xuICAgIGlmICh0aGlzLmhhbmRsZXJzLmNvbXBsZXRlLmluZGV4T2YoY2IpID09PSAtMSkge1xuICAgICAgdGhpcy5oYW5kbGVycy5jb21wbGV0ZS5wdXNoKGNiKTtcbiAgICB9XG4gIH1cblxuICBvbkxvb3BDb21wbGV0ZShjYjogT25Mb29wQ29tcGxldGVDYWxsYmFjaykge1xuICAgIGlmICh0aGlzLmhhbmRsZXJzLmxvb3AuaW5kZXhPZihjYikgPT09IC0xKSB7XG4gICAgICB0aGlzLmhhbmRsZXJzLmxvb3AucHVzaChjYik7XG4gICAgfVxuICB9XG5cbiAgb25EZXN0cm95KGNiOiAoKSA9PiB2b2lkKSB7XG4gICAgaWYgKHRoaXMuaGFuZGxlcnMuZGVzdHJveS5pbmRleE9mKGNiKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaGFuZGxlcnMuZGVzdHJveS5wdXNoKGNiKTtcbiAgICB9XG4gIH1cblxuICBvbkRhdGFSZWFkeShjYjogKCkgPT4gdm9pZCkge1xuICAgIGlmICh0aGlzLmhhbmRsZXJzLmRhdGFSZWFkeS5pbmRleE9mKGNiKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaGFuZGxlcnMuZGF0YVJlYWR5LnB1c2goY2IpO1xuICAgIH1cbiAgfVxuXG4gIG9uRXJyb3IoY2I6ICgpID0+IHZvaWQpIHtcbiAgICBpZiAodGhpcy5oYW5kbGVycy5lcnJvci5pbmRleE9mKGNiKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaGFuZGxlcnMuZXJyb3IucHVzaChjYik7XG4gICAgfVxuICB9XG5cbiAgcGxheSgpIHtcbiAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbSkgcmV0dXJuO1xuICAgIGNvbnN0IGZyYW1lID0gdGhpcy5hbmltYXRpb25JdGVtLnBsYXlEaXJlY3Rpb24gPT09IDEgPyAwIDogdGhpcy5mcmFtZXM7XG4gICAgdGhpcy5hbmltYXRpb25JdGVtLmdvVG9BbmRQbGF5KGZyYW1lLCB0cnVlKTtcbiAgICB0aGlzLmN1cnJlbnRTdGF0ZSA9IFBsYXllclN0YXRlLlBsYXlpbmc7XG4gIH1cblxuICBzdG9wKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25JdGVtKSByZXR1cm47XG5cbiAgICBpZiAodGhpcy5pc1BsYXlpbmcpIHtcbiAgICAgIGNvbnN0IHtwbGF5RGlyZWN0aW9ufSA9IHRoaXMuYW5pbWF0aW9uSXRlbTtcbiAgICAgIGNvbnN0IGZyYW1lID0gcGxheURpcmVjdGlvbiA9PT0gMSA/IDAgOiB0aGlzLmZyYW1lcztcbiAgICAgIHRoaXMuYW5pbWF0aW9uSXRlbS5nb1RvQW5kU3RvcChmcmFtZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50U3RhdGUgPSBQbGF5ZXJTdGF0ZS5TdG9wcGVkO1xuICB9XG5cbiAgLy8gUmVzdW1lIGRlY2lzaW9uIGlzIGRyaXZlbiBieSBgaXNQbGF5aW5nYCBhdCB0aGUgbW9tZW50IG9mIHBhdXNlOlxuICAvLyAtIENvbnRpbnVvdXMgYXV0b3BsYXkrbG9vcDogd2FzIHBsYXlpbmcg4oaSIHJlc3VtZXMgb24gcmUtZW50cnkuXG4gIC8vIC0gUGxheS1vbmNlLCBmaW5pc2hlZDogd2FzIG5vdCBwbGF5aW5nIOKGkiBzdGF5cyBzdG9wcGVkLlxuICAvLyAtIFBsYXktb25jZSwgbWlkLXBsYXk6IHdhcyBwbGF5aW5nIOKGkiByZXN1bWVzIGZyb20gaXRzIHBhdXNlZCBmcmFtZS5cbiAgLy8gLSBJWDIvSVgzLWRyaXZlbjogbG90dGllLXdlYidzIHJBRiBpc24ndCBydW5uaW5nIChJWCBkcml2ZXMgZnJhbWVzXG4gIC8vICAgdmlhIHNldEN1cnJlbnRSYXdGcmFtZVZhbHVlIC8gZ29Ub0FuZFN0b3ApLCBzbyBgaXNQbGF5aW5nYCBpc1xuICAvLyAgIGZhbHNlIGFuZCB3ZSBsZWF2ZSBjb250cm9sIHRvIHRoZSBpbnRlcmFjdGlvbiBzeXN0ZW0uXG4gIHBhdXNlQnlWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzT2Zmc2NyZWVuID0gdHJ1ZTtcbiAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbSkgcmV0dXJuO1xuICAgIHRoaXMuX3dhc1BsYXlpbmdCZWZvcmVQYXVzZSA9IHRoaXMuaXNQbGF5aW5nO1xuICAgIGlmICh0aGlzLmlzUGxheWluZykge1xuICAgICAgdGhpcy5hbmltYXRpb25JdGVtLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzdW1lQnlWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzT2Zmc2NyZWVuID0gZmFsc2U7XG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbkl0ZW0pIHJldHVybjtcblxuICAgIC8vIElYLWRyaXZlbiBhbmltYXRpb25zIHNjcnViIGZyYW1lcyB2aWEgZ29Ub0ZyYW1lIC8gZ29Ub0ZyYW1lQW5kU3RvcFxuICAgIC8vIHdoaWxlIHdlIHdlcmUgb2Zmc2NyZWVuOyB0aG9zZSBjYWxscyBuby1vcCdkLiBSZXBsYXkgdGhlIGxhdGVzdFxuICAgIC8vIHJlcXVlc3RlZCBmcmFtZSBzbyB0aGUgZWxlbWVudCByZWZsZWN0cyBpdHMgY3VycmVudCBzdGF0ZS5cbiAgICBpZiAodGhpcy5fc2tpcHBlZEZyYW1lICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9uSXRlbS5nb1RvQW5kU3RvcCh0aGlzLl9za2lwcGVkRnJhbWUsIHRydWUpO1xuICAgICAgdGhpcy5fc2tpcHBlZEZyYW1lID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fd2FzUGxheWluZ0JlZm9yZVBhdXNlKSB7XG4gICAgICB0aGlzLl93YXNQbGF5aW5nQmVmb3JlUGF1c2UgPSBmYWxzZTtcbiAgICAgIHRoaXMuYW5pbWF0aW9uSXRlbS5wbGF5KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRWFnZXIgKyBvZmZzY3JlZW4gKyBhdXRvcGxheSBlZGdlIGNhc2U6IGRhdGEgbG9hZGVkIHdoaWxlIHRoZVxuICAgIC8vIGVsZW1lbnQgd2FzIG9mZnNjcmVlbiwgc28gdGhlIGF1dG9wbGF5IHBhdGggZGVmZXJyZWQgcGxheWJhY2suXG4gICAgLy8gRmlyZSBpdCBub3cgdGhhdCB0aGUgZWxlbWVudCBpcyB2aXNpYmxlLlxuICAgIGlmICh0aGlzLl9wZW5kaW5nQXV0b3BsYXkpIHtcbiAgICAgIHRoaXMuX3BlbmRpbmdBdXRvcGxheSA9IGZhbHNlO1xuICAgICAgdGhpcy5wbGF5KCk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbSkgcmV0dXJuO1xuXG4gICAgaWYgKHRoaXMuaXNQbGF5aW5nKSB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLmhhbmRsZXJzLmRlc3Ryb3kuZm9yRWFjaCgoY2IpID0+IGNiKCkpO1xuXG4gICAgaWYgKHRoaXMuY29udGFpbmVyKSB7XG4gICAgICBjYWNoZS5kZWxldGUodGhpcy5jb250YWluZXIpO1xuICAgIH1cblxuICAgIHRoaXMuYW5pbWF0aW9uSXRlbS5kZXN0cm95KCk7XG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLmhhbmRsZXJzKS5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICBoYW5kbGVyLmxlbmd0aCA9IDA7XG4gICAgfSk7XG4gICAgdGhpcy5faXNPZmZzY3JlZW4gPSBmYWxzZTtcbiAgICB0aGlzLl93YXNQbGF5aW5nQmVmb3JlUGF1c2UgPSBmYWxzZTtcbiAgICB0aGlzLl9wZW5kaW5nQXV0b3BsYXkgPSBmYWxzZTtcbiAgICB0aGlzLl9za2lwcGVkRnJhbWUgPSBudWxsO1xuICAgIHRoaXMuYW5pbWF0aW9uSXRlbSA9IG51bGw7XG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuY29uZmlnID0gbnVsbDtcbiAgfVxuXG4gIGdldCBnc2FwRnJhbWUoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2dzYXBGcmFtZTtcbiAgfVxuXG4gIHNldCBnc2FwRnJhbWUodmFsdWU6IG51bWJlciB8IG51bGwpIHtcbiAgICB0aGlzLl9nc2FwRnJhbWUgPSB2YWx1ZTtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuO1xuICAgIHRoaXMuZ29Ub0ZyYW1lQW5kU3RvcCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgaXNQbGF5aW5nKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25JdGVtKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuICF0aGlzLmFuaW1hdGlvbkl0ZW0uaXNQYXVzZWQ7XG4gIH1cblxuICBnZXQgaXNQYXVzZWQoKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbkl0ZW0pIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdGhpcy5hbmltYXRpb25JdGVtLmlzUGF1c2VkO1xuICB9XG5cbiAgZ2V0IGR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbkl0ZW0pIHJldHVybiAwO1xuICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbkl0ZW0uZ2V0RHVyYXRpb24oKTtcbiAgfVxuXG4gIGdldCBmcmFtZXMoKTogbnVtYmVyIHtcbiAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbSkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uSXRlbS50b3RhbEZyYW1lcztcbiAgfVxuXG4gIGdldCBkaXJlY3Rpb24oKTogMSB8IC0xIHtcbiAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbSkgcmV0dXJuIDE7XG4gICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uSXRlbS5wbGF5RGlyZWN0aW9uID09PSAxID8gMSA6IC0xO1xuICB9XG5cbiAgZ2V0IGlzTG9hZGVkKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25JdGVtKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uSXRlbS5pc0xvYWRlZDtcbiAgfVxuXG4gIGdldCBpeDJJbml0aWFsVmFsdWUoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnID8gdGhpcy5jb25maWcuaXgySW5pdGlhbFZhbHVlIDogbnVsbDtcbiAgfVxuXG4gIGdvVG9GcmFtZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbkl0ZW0pIHJldHVybjtcbiAgICBpZiAodGhpcy5faXNPZmZzY3JlZW4pIHtcbiAgICAgIHRoaXMuX3NraXBwZWRGcmFtZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmFuaW1hdGlvbkl0ZW0uc2V0Q3VycmVudFJhd0ZyYW1lVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgZ29Ub0ZyYW1lQW5kU3RvcCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbkl0ZW0pIHJldHVybjtcbiAgICBpZiAodGhpcy5faXNPZmZzY3JlZW4pIHtcbiAgICAgIHRoaXMuX3NraXBwZWRGcmFtZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmFuaW1hdGlvbkl0ZW0uZ29Ub0FuZFN0b3AodmFsdWUsIHRydWUpO1xuICB9XG5cbiAgc2V0U3ViZnJhbWUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbSkgcmV0dXJuO1xuICAgIHRoaXMuYW5pbWF0aW9uSXRlbS5zZXRTdWJmcmFtZSh2YWx1ZSk7XG4gIH1cblxuICBzZXRTcGVlZCh2YWx1ZTogbnVtYmVyID0gMSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25JdGVtKSByZXR1cm47XG4gICAgaWYgKHRoaXMuaXNQbGF5aW5nKSB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLmFuaW1hdGlvbkl0ZW0uc2V0U3BlZWQodmFsdWUpO1xuICB9XG5cbiAgc2V0TG9vcGluZyh2YWx1ZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25JdGVtKSByZXR1cm47XG4gICAgaWYgKHRoaXMuaXNQbGF5aW5nKSB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLmFuaW1hdGlvbkl0ZW0ubG9vcCA9IHZhbHVlO1xuICB9XG5cbiAgc2V0RGlyZWN0aW9uKHZhbHVlOiAxIHwgLTEpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuYW5pbWF0aW9uSXRlbSkgcmV0dXJuO1xuICAgIGlmICh0aGlzLmlzUGxheWluZykgdGhpcy5zdG9wKCk7XG4gICAgdGhpcy5hbmltYXRpb25JdGVtLnNldERpcmVjdGlvbih2YWx1ZSk7XG4gICAgdGhpcy5nb1RvRnJhbWUodmFsdWUgPT09IDEgPyAwIDogdGhpcy5mcmFtZXMpO1xuICB9XG59XG5cbi8vIHJvb3RNYXJnaW4gaXMgZXhwcmVzc2VkIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgdmlld3BvcnQgaGVpZ2h0IHNvIGl0XG4vLyBzY2FsZXMgd2l0aCB0aGUgdXNlcidzIGFjdHVhbCBkaXNwbGF5LiBBIGZpeGVkIHBpeGVsIHZhbHVlIChlLmcuIDEyNTBweClcbi8vIGlzIHNtYWxsZXIgdGhhbiBvbmUgdmlld3BvcnQgb24gNUsrIG1vbml0b3JzLCB3aGljaCBkZWZlYXRzIHRoZSBwb2ludFxuLy8gb2YgcHJlbG9hZGluZyBiZWZvcmUgdGhlIGVsZW1lbnQgZW50ZXJzIHZpZXcuXG5mdW5jdGlvbiBnZXRMYXp5TG9hZFJvb3RNYXJnaW4oKTogc3RyaW5nIHtcbiAgY29uc3QgY29ubmVjdGlvbiA9IChuYXZpZ2F0b3IgYXMgYW55KS5jb25uZWN0aW9uO1xuICBpZiAoY29ubmVjdGlvbj8uZWZmZWN0aXZlVHlwZSkge1xuICAgIHN3aXRjaCAoY29ubmVjdGlvbi5lZmZlY3RpdmVUeXBlKSB7XG4gICAgICBjYXNlICdzbG93LTJnJzpcbiAgICAgIGNhc2UgJzJnJzpcbiAgICAgICAgcmV0dXJuICczMDAlIDAlJztcbiAgICAgIGNhc2UgJzNnJzpcbiAgICAgICAgcmV0dXJuICcyNTAlIDAlJztcbiAgICAgIGNhc2UgJzRnJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnMTUwJSAwJSc7XG4gICAgfVxuICB9XG4gIHJldHVybiAnMTUwJSAwJSc7XG59XG5cbmxldCBsYXp5TG9hZE9ic2VydmVyOiBJbnRlcnNlY3Rpb25PYnNlcnZlciB8IG51bGwgPSBudWxsO1xubGV0IHZpc2liaWxpdHlPYnNlcnZlcjogSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcblxuY29uc3QgZ2V0TG90dGllRWxlbWVudHMgPSAoKTogQXJyYXk8SFRNTEVsZW1lbnQ+ID0+XG4gIEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYW5pbWF0aW9uLXR5cGU9XCJsb3R0aWVcIl0nKSk7XG5cbmNvbnN0IGhhc0l4ID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSA9PiB7XG4gIGNvbnN0IGRhdGFzZXQgPSBlbGVtZW50LmRhdGFzZXQ7XG4gIGNvbnN0IGhhc1dmVGFyZ2V0ID0gQm9vbGVhbihkYXRhc2V0LndmVGFyZ2V0KTtcbiAgY29uc3QgaXNJeDJUYXJnZXQgPSBwYXJzZU51bWJlcihkYXRhc2V0LmlzSXgyVGFyZ2V0KSA9PT0gMTtcbiAgcmV0dXJuIGhhc1dmVGFyZ2V0IHx8IGlzSXgyVGFyZ2V0O1xufTtcblxuY29uc3QgaXNFYWdlckxvYWRpbmcgPSAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuID0+IHtcbiAgY29uc3QgbG9hZGluZyA9IGVsZW1lbnQuZGF0YXNldC5sb2FkaW5nO1xuICByZXR1cm4gbG9hZGluZyAhPT0gJ2xhenknO1xufTtcblxuY29uc3Qgb2JzZXJ2ZVZpc2liaWxpdHkgPSAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkID0+IHtcbiAgaWYgKHR5cGVvZiBJbnRlcnNlY3Rpb25PYnNlcnZlciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcbiAgZ2V0VmlzaWJpbGl0eU9ic2VydmVyKCkub2JzZXJ2ZShlbGVtZW50KTtcbn07XG5cbmZ1bmN0aW9uIGdldFZpc2liaWxpdHlPYnNlcnZlcigpOiBJbnRlcnNlY3Rpb25PYnNlcnZlciB7XG4gIGlmICghdmlzaWJpbGl0eU9ic2VydmVyKSB7XG4gICAgdmlzaWJpbGl0eU9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gICAgICBlbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbnRyeS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gY2FjaGUuZ2V0KGVsZW1lbnQpO1xuICAgICAgICBpZiAoIWluc3RhbmNlKSByZXR1cm47XG4gICAgICAgIGlmIChlbnRyeS5pc0ludGVyc2VjdGluZykge1xuICAgICAgICAgIGluc3RhbmNlLnJlc3VtZUJ5VmlzaWJpbGl0eSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluc3RhbmNlLnBhdXNlQnlWaXNpYmlsaXR5KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiB2aXNpYmlsaXR5T2JzZXJ2ZXI7XG59XG5cbmZ1bmN0aW9uIGdldExhenlMb2FkT2JzZXJ2ZXIoKTogSW50ZXJzZWN0aW9uT2JzZXJ2ZXIge1xuICBpZiAoIWxhenlMb2FkT2JzZXJ2ZXIpIHtcbiAgICBsYXp5TG9hZE9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKFxuICAgICAgKGVudHJpZXMpID0+IHtcbiAgICAgICAgZW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgICAgIGlmICghZW50cnkuaXNJbnRlcnNlY3RpbmcpIHJldHVybjtcbiAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgIGxhenlMb2FkT2JzZXJ2ZXI/LnVub2JzZXJ2ZShlbGVtZW50KTtcbiAgICAgICAgICBpZiAoIWhhc0l4KGVsZW1lbnQpKSBjbGVhbnVwRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgICBjcmVhdGVJbnN0YW5jZShlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAge3Jvb3RNYXJnaW46IGdldExhenlMb2FkUm9vdE1hcmdpbigpfVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIGxhenlMb2FkT2JzZXJ2ZXI7XG59XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVJbnN0YW5jZSA9IChjb250YWluZXI6IEhUTUxFbGVtZW50KSA9PiB7XG4gIGxldCBsb3R0aWVJbnN0YW5jZSA9IGNhY2hlLmdldChjb250YWluZXIpO1xuXG4gIGlmIChsb3R0aWVJbnN0YW5jZSA9PSBudWxsKSB7XG4gICAgbG90dGllSW5zdGFuY2UgPSBuZXcgTG90dGllSW5zdGFuY2UoKTtcbiAgfVxuXG4gIGxvdHRpZUluc3RhbmNlLmxvYWQoY29udGFpbmVyKTtcbiAgLy8gRXZlcnkgTG90dGllIGluc3RhbmNlIChEZXNpZ25lciwgQ2FudmFzLCBJWCBwbHVnaW5zLCBwdWJsaXNoZWQgc2l0ZSlcbiAgLy8gZmxvd3MgdGhyb3VnaCBoZXJlLCBzbyB2aXNpYmlsaXR5IG9ic2VydmF0aW9uIGlzIHdpcmVkIHVwIGNlbnRyYWxseSDigJRcbiAgLy8gaW5pdCgpJ3MgZWFnZXIgcGF0aCBhbmQgdGhlIGxhenktbG9hZCBjYWxsYmFjayBkb24ndCBuZWVkIHRvIGNhbGwgdGhpc1xuICAvLyB0aGVtc2VsdmVzLlxuICBvYnNlcnZlVmlzaWJpbGl0eShjb250YWluZXIpO1xuXG4gIHJldHVybiBsb3R0aWVJbnN0YW5jZTtcbn07XG5cbmV4cG9ydCBjb25zdCBjbGVhbnVwRWxlbWVudCA9IChlbGVtZW50OiBIVE1MRWxlbWVudCkgPT4ge1xuICBjb25zdCBsb3R0aWVJbnN0YW5jZSA9IGNhY2hlLmdldChlbGVtZW50KTtcbiAgaWYgKGxvdHRpZUluc3RhbmNlKSB7XG4gICAgbG90dGllSW5zdGFuY2UuZGVzdHJveSgpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdCA9ICgpID0+IHtcbiAgZ2V0TG90dGllRWxlbWVudHMoKS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgaWYgKFxuICAgICAgaXNFYWdlckxvYWRpbmcoZWxlbWVudCkgfHxcbiAgICAgIHR5cGVvZiBJbnRlcnNlY3Rpb25PYnNlcnZlciA9PT0gJ3VuZGVmaW5lZCdcbiAgICApIHtcbiAgICAgIGlmICghaGFzSXgoZWxlbWVudCkpIGNsZWFudXBFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgY3JlYXRlSW5zdGFuY2UoZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdldExhenlMb2FkT2JzZXJ2ZXIoKS5vYnNlcnZlKGVsZW1lbnQpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgZGVzdHJveSA9ICgpID0+IHtcbiAgZ2V0TG90dGllRWxlbWVudHMoKS5mb3JFYWNoKGNsZWFudXBFbGVtZW50KTtcbiAgaWYgKGxhenlMb2FkT2JzZXJ2ZXIpIHtcbiAgICBsYXp5TG9hZE9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICBsYXp5TG9hZE9ic2VydmVyID0gbnVsbDtcbiAgfVxuICBpZiAodmlzaWJpbGl0eU9ic2VydmVyKSB7XG4gICAgdmlzaWJpbGl0eU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB2aXNpYmlsaXR5T2JzZXJ2ZXIgPSBudWxsO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVhZHkgPSBpbml0O1xuXG5leHBvcnQgaW50ZXJmYWNlIExvdHRpZU1vZHVsZSB7XG4gIGNyZWF0ZUluc3RhbmNlOiB0eXBlb2YgY3JlYXRlSW5zdGFuY2U7XG4gIGNsZWFudXBFbGVtZW50OiB0eXBlb2YgY2xlYW51cEVsZW1lbnQ7XG4gIGluaXQ6IHR5cGVvZiBpbml0O1xuICBkZXN0cm95OiB0eXBlb2YgZGVzdHJveTtcbiAgcmVhZHk6IHR5cGVvZiByZWFkeTtcbiAgbG90dGllOiBMb3R0aWVQbGF5ZXI7XG59XG4iXSwibmFtZXMiOlsiY2xlYW51cEVsZW1lbnQiLCJjcmVhdGVJbnN0YW5jZSIsImRlc3Ryb3kiLCJpbml0IiwicmVhZHkiLCJsb2FkQW5pbWF0aW9uIiwid2luIiwicGFyYW1zIiwiV2ViZmxvdyIsInJlcXVpcmUiLCJsb3R0aWUiLCJpc0luRGVzaWduZXIiLCJCb29sZWFuIiwiZW52IiwiUGxheWVyU3RhdGUiLCJQbGF5aW5nIiwiU3RvcHBlZCIsIkNhY2hlIiwiX2NhY2hlIiwic2V0IiwiY29udGFpbmVyIiwiaW5zdGFuY2UiLCJpbmRleCIsImZpbmRJbmRleCIsIndyYXBwZXIiLCJzcGxpY2UiLCJwdXNoIiwiZGVsZXRlIiwiZ2V0IiwiY2FjaGUiLCJlbXB0eURhdGFzZXQiLCJwYXJzZU51bWJlciIsInZhbHVlIiwiTmFOIiwicGFyc2VkIiwicGFyc2VGbG9hdCIsIk51bWJlciIsImlzTmFOIiwiTG90dGllSW5zdGFuY2UiLCJjb25maWciLCJjdXJyZW50U3RhdGUiLCJhbmltYXRpb25JdGVtIiwiX2dzYXBGcmFtZSIsIl9pc09mZnNjcmVlbiIsIl93YXNQbGF5aW5nQmVmb3JlUGF1c2UiLCJfcGVuZGluZ0F1dG9wbGF5IiwiX3NraXBwZWRGcmFtZSIsImhhbmRsZXJzIiwiZW50ZXJGcmFtZSIsImNvbXBsZXRlIiwibG9vcCIsImRhdGFSZWFkeSIsImVycm9yIiwibG9hZCIsImRhdGFzZXQiLCJzcmMiLCJlbmRzV2l0aCIsImZldGNoTG90dGllIiwidGhlbiIsImFuaW1hdGlvbkRhdGEiLCJfbG9hZEFuaW1hdGlvbiIsInVuZGVmaW5lZCIsInByZXNlcnZlQXNwZWN0UmF0aW8iLCJyZW5kZXJlciIsImRpcmVjdGlvbk51bWJlciIsImRpcmVjdGlvbiIsImhhc1dmVGFyZ2V0Iiwid2ZUYXJnZXQiLCJhdXRvcGxheSIsImR1cmF0aW9uTnVtYmVyIiwiZHVyYXRpb24iLCJoYXNJeDIiLCJpc0l4MlRhcmdldCIsInJhd0l4MkluaXRpYWxWYWx1ZSIsIml4MkluaXRpYWxTdGF0ZSIsIml4MkluaXRpYWxWYWx1ZSIsInNldExvb3BpbmciLCJzZXREaXJlY3Rpb24iLCJjdXJyZW50RHVyYXRpb24iLCJzZXRTcGVlZCIsInBsYXkiLCJwZXJjZW50IiwiZ29Ub0ZyYW1lIiwiZnJhbWVzIiwib3B0aW9ucyIsInJlbmRlcmVyU2V0dGluZ3MiLCJwcm9ncmVzc2l2ZUxvYWQiLCJoaWRlT25UcmFuc3BhcmVudCIsIm93bmVyRG9jdW1lbnQiLCJkZWZhdWx0VmlldyIsInBhdGgiLCJlcnIiLCJmb3JFYWNoIiwiY2IiLCJhZGRFdmVudExpc3RlbmVyIiwiaXNQbGF5aW5nIiwiY3VycmVudEZyYW1lIiwidG90YWxGcmFtZXMiLCJwbGF5RGlyZWN0aW9uIiwidG9QZXJjZW50IiwicGVyY2VudGFnZSIsIk1hdGgiLCJyb3VuZCIsImxvb3BDb21wbGV0ZSIsImlzTG9hZGVkIiwib25GcmFtZUNoYW5nZSIsImluZGV4T2YiLCJvblBsYXliYWNrQ29tcGxldGUiLCJvbkxvb3BDb21wbGV0ZSIsIm9uRGVzdHJveSIsIm9uRGF0YVJlYWR5Iiwib25FcnJvciIsImZyYW1lIiwiZ29Ub0FuZFBsYXkiLCJzdG9wIiwiZ29Ub0FuZFN0b3AiLCJwYXVzZUJ5VmlzaWJpbGl0eSIsInBhdXNlIiwicmVzdW1lQnlWaXNpYmlsaXR5IiwiT2JqZWN0IiwidmFsdWVzIiwiaGFuZGxlciIsImxlbmd0aCIsImdzYXBGcmFtZSIsImdvVG9GcmFtZUFuZFN0b3AiLCJpc1BhdXNlZCIsImdldER1cmF0aW9uIiwic2V0Q3VycmVudFJhd0ZyYW1lVmFsdWUiLCJzZXRTdWJmcmFtZSIsImdldExhenlMb2FkUm9vdE1hcmdpbiIsImNvbm5lY3Rpb24iLCJuYXZpZ2F0b3IiLCJlZmZlY3RpdmVUeXBlIiwibGF6eUxvYWRPYnNlcnZlciIsInZpc2liaWxpdHlPYnNlcnZlciIsImdldExvdHRpZUVsZW1lbnRzIiwiQXJyYXkiLCJmcm9tIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaGFzSXgiLCJlbGVtZW50IiwiaXNFYWdlckxvYWRpbmciLCJsb2FkaW5nIiwib2JzZXJ2ZVZpc2liaWxpdHkiLCJJbnRlcnNlY3Rpb25PYnNlcnZlciIsImdldFZpc2liaWxpdHlPYnNlcnZlciIsIm9ic2VydmUiLCJlbnRyaWVzIiwiZW50cnkiLCJ0YXJnZXQiLCJpc0ludGVyc2VjdGluZyIsImdldExhenlMb2FkT2JzZXJ2ZXIiLCJ1bm9ic2VydmUiLCJyb290TWFyZ2luIiwibG90dGllSW5zdGFuY2UiLCJkaXNjb25uZWN0Il0sIm1hcHBpbmdzIjoiQUFBQSxzQkFBc0I7Ozs7Ozs7Ozs7O0lBNG5CVEEsY0FBYztlQUFkQTs7SUFqQkFDLGNBQWM7ZUFBZEE7O0lBc0NBQyxPQUFPO2VBQVBBOztJQWRBQyxJQUFJO2VBQUpBOztJQTBCQUMsS0FBSztlQUFMQTs7O2tDQTdvQmE7QUFNMUIsTUFBTUMsZ0JBQWdCLENBQ3BCQyxLQUNBQyxTQUVBRCxJQUFJRSxPQUFPLENBQUNDLE9BQU8sQ0FBQyxXQUFXQyxPQUFPTCxjQUNwQ0U7QUFHSixNQUFNSSxlQUFlLENBQUNMLE1BQ3BCTSxRQUFRTixJQUFJRSxPQUFPLENBQUNLLEdBQUcsQ0FBQyxhQUFhUCxJQUFJRSxPQUFPLENBQUNLLEdBQUcsQ0FBQztBQUV2RCxNQUFNQyxjQUFjO0lB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

}),
2444: (function (module, __unused_webpack_exports, __webpack_require__) {

var Webflow = __webpack_require__(3949);
var lottieSiteModule = __webpack_require__(5897);
var lottie = __webpack_require__(8724);
Webflow.define('lottie', module.exports = function() {
    return {
        lottie,
        createInstance: lottieSiteModule.createInstance,
        cleanupElement: lottieSiteModule.cleanupElement,
        init: lottieSiteModule.init,
        destroy: lottieSiteModule.destroy,
        ready: lottieSiteModule.ready
    };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9yZW5kZXIvcGx1Z2lucy9BbmltYXRpb24vd2ViZmxvdy1sb3R0aWUuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIFdlYmZsb3cgPSByZXF1aXJlKCcuLi9CYXNlU2l0ZU1vZHVsZXMvd2ViZmxvdy1saWInKTtcbnZhciBsb3R0aWVTaXRlTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGVzL0xvdHRpZVNpdGVNb2R1bGUnKTtcbnZhciBsb3R0aWUgPSByZXF1aXJlKCdsb3R0aWUtd2ViL2J1aWxkL3BsYXllci9sb3R0aWUubWluJyk7XG5cbldlYmZsb3cuZGVmaW5lKFxuICAnbG90dGllJyxcbiAgKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsb3R0aWUsXG4gICAgICBjcmVhdGVJbnN0YW5jZTogbG90dGllU2l0ZU1vZHVsZS5jcmVhdGVJbnN0YW5jZSxcbiAgICAgIGNsZWFudXBFbGVtZW50OiBsb3R0aWVTaXRlTW9kdWxlLmNsZWFudXBFbGVtZW50LFxuICAgICAgaW5pdDogbG90dGllU2l0ZU1vZHVsZS5pbml0LFxuICAgICAgZGVzdHJveTogbG90dGllU2l0ZU1vZHVsZS5kZXN0cm95LFxuICAgICAgcmVhZHk6IGxvdHRpZVNpdGVNb2R1bGUucmVhZHksXG4gICAgfTtcbiAgfSlcbik7XG4iXSwibmFtZXMiOlsiV2ViZmxvdyIsInJlcXVpcmUiLCJsb3R0aWVTaXRlTW9kdWxlIiwibG90dGllIiwiZGVmaW5lIiwibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZUluc3RhbmNlIiwiY2xlYW51cEVsZW1lbnQiLCJpbml0IiwiZGVzdHJveSIsInJlYWR5Il0sIm1hcHBpbmdzIjoiO0FBQUEsSUFBSUEsVUFBVUMsUUFBUTtBQUN0QixJQUFJQyxtQkFBbUJELFFBQVE7QUFDL0IsSUFBSUUsU0FBU0YsUUFBUTtBQUVyQkQsUUFBUUksTUFBTSxDQUNaLFVBQ0NDLE9BQU9DLE9BQU8sR0FBRztJQUNoQixPQUFPO1FBQ0xIO1FBQ0FJLGdCQUFnQkwsaUJBQWlCSyxjQUFjO1FBQy9DQyxnQkFBZ0JOLGlCQUFpQk0sY0FBYztRQUMvQ0MsTUFBTVAsaUJBQWlCTyxJQUFJO1FBQzNCQyxTQUFTUixpQkFBaUJRLE9BQU87UUFDakNDLE9BQU9ULGlCQUFpQlMsS0FBSztJQUMvQjtBQUNGIn0=

}),
3487: (function (__unused_webpack_module, exports) {
// MIT License
//
// Copyright (c) 2020 Arjun Barrett
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    strFromU8: function() {
        return strFromU8;
    },
    unzip: function() {
        return unzip;
    }
});
const ch2 = {}, wk = function(c, id, msg, transfer, cb) {
    const w = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
        c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
    ], {
        type: "text/javascript"
    }))));
    return w.onmessage = function(e) {
        const d = e.data, ed = d.$e$;
        if (ed) {
            const err = new Error(ed[0]);
            err.code = ed[1], err.stack = ed[2], cb(err, null);
        } else cb(null, d);
    }, w.postMessage(msg, transfer), w;
}, u8 = Uint8Array, u16 = Uint16Array, u32 = Uint32Array, fleb = new u8([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    0,
    0,
    0,
    0
]), fdeb = new u8([
    0,
    0,
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    8,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    12,
    12,
    13,
    13,
    0,
    0
]), clim = new u8([
    16,
    17,
    18,
    0,
    8,
    7,
    9,
    6,
    10,
    5,
    11,
    4,
    12,
    3,
    13,
    2,
    14,
    1,
    15
]), freb = function(eb, start) {
    const b = new u16(31);
    for(var i = 0; i < 31; ++i)b[i] = start += 1 << eb[i - 1];
    const r = new u32(b[30]);
    for(i = 1; i < 30; ++i)for(let j = b[i]; j < b[i + 1]; ++j)r[j] = j - b[i] << 5 | i;
    return [
        b,
        r
    ];
}, _a = freb(fleb, 2), fl = _a[0], revfl = _a[1];
fl[28] = 258, revfl[258] = 28;
const _b = freb(fdeb, 0), fd = _b[0], rev = new u16(32768);
for(var i = 0; i < 32768; ++i){
    let x = (43690 & i) >>> 1 | (21845 & i) << 1;
    x = (52428 & x) >>> 2 | (13107 & x) << 2, x = (61680 & x) >>> 4 | (3855 & x) << 4, rev[i] = ((65280 & x) >>> 8 | (255 & x) << 8) >>> 1;
}
const hMap = function(cd, mb, r) {
    const s = cd.length;
    let i = 0;
    const l = new u16(mb);
    for(; i < s; ++i)cd[i] && ++l[cd[i] - 1];
    const le = new u16(mb);
    for(i = 0; i < mb; ++i)le[i] = le[i - 1] + l[i - 1] << 1;
    let co;
    if (r) {
        co = new u16(1 << mb);
        const rvb = 15 - mb;
        for(i = 0; i < s; ++i)if (cd[i]) {
            const sv = i << 4 | cd[i], r_1 = mb - cd[i];
            let v = le[cd[i] - 1]++ << r_1;
            for(let m = v | (1 << r_1) - 1; v <= m; ++v)co[rev[v] >>> rvb] = sv;
        }
    } else for(co = new u16(s), i = 0; i < s; ++i)cd[i] && (co[i] = rev[le[cd[i] - 1]++] >>> 15 - cd[i]);
    return co;
}, flt = new u8(288);
for(i = 0; i < 144; ++i)flt[i] = 8;
for(i = 144; i < 256; ++i)flt[i] = 9;
for(i = 256; i < 280; ++i)flt[i] = 7;
for(i = 280; i < 288; ++i)flt[i] = 8;
const fdt = new u8(32);
for(i = 0; i < 32; ++i)fdt[i] = 5;
const flrm = hMap(flt, 9, 1), fdrm = hMap(fdt, 5, 1), max = function(a) {
    let m = a[0];
    for(let i = 1; i < a.length; ++i)a[i] > m && (m = a[i]);
    return m;
}, bits = function(d, p, m) {
    const o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8) >> (7 & p) & m;
}, bits16 = function(d, p) {
    const o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (7 & p);
}, shft = function(p) {
    return (p + 7) / 8 | 0;
}, slc = function(v, s, e) {
    (null == s || s < 0) && (s = 0), (null == e || e > v.length) && (e = v.length);
    const n = new (2 === v.BYTES_PER_ELEMENT ? u16 : 4 === v.BYTES_PER_ELEMENT ? u32 : u8)(e - s);
    return n.set(v.subarray(s, e)), n;
}, ec = [
    "unexpected EOF",
    "invalid block type",
    "invalid length/literal",
    "invalid distance",
    "stream finished",
    "no stream handler",
    ,
    "no callback",
    "invalid UTF-8 data",
    "extra field too long",
    "date not in range 1980-2099",
    "filename too long",
    "stream finishing",
    "invalid zip data"
];
var err = function(ind, msg, nt) {
    const e = new Error(msg || ec[ind]);
    if (e.code = ind, Error.captureStackTrace && Error.captureStackTrace(e, err), !nt) throw e;
    return e;
};
const inflt = function(dat, buf, st) {
    const sl = dat.length;
    if (!sl || st && st.f && !st.l) return buf || new u8(0);
    const noBuf = !buf || st, noSt = !st || st.i;
    st || (st = {}), buf || (buf = new u8(3 * sl));
    const cbuf = function(l) {
        const bl = buf.length;
        if (l > bl) {
            const nbuf = new u8(Math.max(2 * bl, l));
            nbuf.set(buf), buf = nbuf;
        }
    };
    let final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    const tbts = 8 * sl;
    do {
        if (!lm) {
            final = bits(dat, pos, 1);
            const type = bits(dat, pos + 1, 3);
            if (pos += 3, !type) {
                const l = dat[(s = shft(pos) + 4) - 4] | dat[s - 3] << 8, t = s + l;
                if (t > sl) {
                    noSt && err(0);
                    break;
                }
                noBuf && cbuf(bt + l), buf.set(dat.subarray(s, t), bt), st.b = bt += l, st.p = pos = 8 * t, st.f = final;
                continue;
            }
            if (1 === type) lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (2 === type) {
                const hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4, tl = hLit + bits(dat, pos + 5, 31) + 1;
                pos += 14;
                const ldt = new u8(tl), clt = new u8(19);
                for(var i = 0; i < hcLen; ++i)clt[clim[i]] = bits(dat, pos + 3 * i, 7);
                pos += 3 * hcLen;
                const clb = max(clt), clbmsk = (1 << clb) - 1, clm = hMap(clt, clb, 1);
                for(i = 0; i < tl;){
                    const r = clm[bits(dat, pos, clbmsk)];
                    var s;
                    if (pos += 15 & r, (s = r >>> 4) < 16) ldt[i++] = s;
                    else {
                        var c = 0;
                        let n = 0;
                        for(16 === s ? (n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1]) : 17 === s ? (n = 3 + bits(dat, pos, 7), pos += 3) : 18 === s && (n = 11 + bits(dat, pos, 127), pos += 7); n--;)ldt[i++] = c;
                    }
                }
                const lt = ldt.subarray(0, hLit);
                var dt = ldt.subarray(hLit);
                lbt = max(lt), dbt = max(dt), lm = hMap(lt, lbt, 1), dm = hMap(dt, dbt, 1);
            } else err(1);
            if (pos > tbts) {
                noSt && err(0);
                break;
            }
        }
        noBuf && cbuf(bt + 131072);
        const lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
        let lpos = pos;
        for(;; lpos = pos){
            const sym = (c = lm[bits16(dat, pos) & lms]) >>> 4;
            if (pos += 15 & c, pos > tbts) {
                noSt && err(0);
                break;
            }
            if (c || err(2), sym < 256) buf[bt++] = sym;
            else {
                if (256 === sym) {
                    lpos = pos, lm = null;
                    break;
                }
                {
                    let add = sym - 254;
                    if (sym > 264) {
                        var b = fleb[i = sym - 257];
                        add = bits(dat, pos, (1 << b) - 1) + fl[i], pos += b;
                    }
                    const d = dm[bits16(dat, pos) & dms], dsym = d >>> 4;
                    d || err(3), pos += 15 & d;
                    dt = fd[dsym];
                    if (dsym > 3) {
                        b = fdeb[dsym];
                        dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
                    }
                    if (pos > tbts) {
                        noSt && err(0);
                        break;
                    }
                    noBuf && cbuf(bt + 131072);
                    const end = bt + add;
                    for(; bt < end; bt += 4)buf[bt] = buf[bt - dt], buf[bt + 1] = buf[bt + 1 - dt], buf[bt + 2] = buf[bt + 2 - dt], buf[bt + 3] = buf[bt + 3 - dt];
                    bt = end;
                }
            }
        }
        st.l = lm, st.p = lpos, st.b = bt, st.f = final, lm && (final = 1, st.m = lbt, st.d = dm, st.n = dbt);
    }while (!final);
    return bt === buf.length ? buf : slc(buf, 0, bt);
}, mrg = function(a, b) {
    const o = {};
    for(var k in a)o[k] = a[k];
    for(var k in b)o[k] = b[k];
    return o;
}, wcln = function(fn, fnStr, td) {
    const dt = fn(), st = fn.toString(), ks = st.slice(st.indexOf("[") + 1, st.lastIndexOf("]")).replace(/\s+/g, "").split(",");
    for(let i = 0; i < dt.length; ++i){
        const v = dt[i], k = ks[i];
        if ("function" == typeof v) {
            fnStr += ";" + k + "=";
            const st_1 = v.toString();
            if (v.prototype) if (-1 !== st_1.indexOf("[native code]")) {
                const spInd = st_1.indexOf(" ", 8) + 1;
                fnStr += st_1.slice(spInd, st_1.indexOf("(", spInd));
            } else {
                fnStr += st_1;
                for(const t in v.prototype)fnStr += ";" + k + ".prototype." + t + "=" + v.prototype[t].toString();
            }
            else fnStr += st_1;
        } else td[k] = v;
    }
    return [
        fnStr,
        td
    ];
}, ch = [], cbfs = function(v) {
    const tl = [];
    for(const k in v)v[k].buffer && tl.push((v[k] = new v[k].constructor(v[k])).buffer);
    return tl;
}, wrkr = function(fns, init, id, cb) {
    let _a;
    if (!ch[id]) {
        let fnStr = "", td_1 = {};
        const m = fns.length - 1;
        for(let i = 0; i < m; ++i)_a = wcln(fns[i], fnStr, td_1), fnStr = _a[0], td_1 = _a[1];
        ch[id] = wcln(fns[m], fnStr, td_1);
    }
    const td = mrg({}, ch[id][1]);
    return wk(ch[id][0] + ";onmessage=function(e){for(var kz in e.data)self[kz]=e.data[kz];onmessage=" + init.toString() + "}", id, td, cbfs(td), cb);
}, bInflt = function() {
    return [
        u8,
        u16,
        u32,
        fleb,
        fdeb,
        clim,
        fl,
        fd,
        flrm,
        fdrm,
        rev,
        ec,
        hMap,
        max,
        bits,
        bits16,
        shft,
        slc,
        err,
        inflt,
        inflateSync,
        pbf,
        gu8
    ];
};
var pbf = function(msg) {
    return postMessage(msg, [
        msg.buffer
    ]);
}, gu8 = function(o) {
    return o && o.size && new u8(o.size);
};
const cbify = function(dat, opts, fns, init, id, cb) {
    var w = wrkr(fns, init, id, function(err, dat) {
        w.terminate(), cb(err, dat);
    });
    return w.postMessage([
        dat,
        opts
    ], opts.consume ? [
        dat.buffer
    ] : []), function() {
        w.terminate();
    };
}, b2 = function(d, b) {
    return d[b] | d[b + 1] << 8;
}, b4 = function(d, b) {
    return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
function inflate(data, opts, cb) {
    return cb || (cb = opts, opts = {}), "function" != typeof cb && err(7), cbify(data, opts, [
        bInflt
    ], function(ev) {
        return pbf(inflateSync(ev.data[0], gu8(ev.data[1])));
    }, 1, cb);
}
function inflateSync(data, out) {
    return inflt(data, out);
}
const td = "undefined" != typeof TextDecoder && new TextDecoder, dutf8 = function(d) {
    for(let r = "", i = 0;;){
        let c = d[i++];
        const eb = (c > 127) + (c > 223) + (c > 239);
        if (i + eb > d.length) return [
            r,
            slc(d, i - 1)
        ];
        eb ? 3 === eb ? (c = ((15 & c) << 18 | (63 & d[i++]) << 12 | (63 & d[i++]) << 6 | 63 & d[i++]) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | 1023 & c)) : r += 1 & eb ? String.fromCharCode((31 & c) << 6 | 63 & d[i++]) : String.fromCharCode((15 & c) << 12 | (63 & d[i++]) << 6 | 63 & d[i++]) : r += String.fromCharCode(c);
    }
};
function strFromU8(dat, latin1) {
    if (latin1) {
        let r = "";
        for(let i = 0; i < dat.length; i += 16384)r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
        return r;
    }
    if (td) return td.decode(dat);
    {
        const _a = dutf8(dat), out = _a[0];
        return _a[1].length && err(8), out;
    }
}
const slzh = function(d, b) {
    return b + 30 + b2(d, b + 26) + b2(d, b + 28);
}, zh = function(d, b, z) {
    const fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(2048 & b2(d, b + 8))), es = b + 46 + fnl, bs = b4(d, b + 20), _a = z && 4294967295 === bs ? z64e(d, es) : [
        bs,
        b4(d, b + 24),
        b4(d, b + 42)
    ], sc = _a[0], su = _a[1], off = _a[2];
    return [
        b2(d, b + 10),
        sc,
        su,
        fn,
        es + b2(d, b + 30) + b2(d, b + 32),
        off
    ];
}, mt = "function" == typeof queueMicrotask ? queueMicrotask : "function" == typeof setTimeout ? setTimeout : function(fn) {
    fn();
};
function unzip(data, opts, cb) {
    cb || (cb = opts, opts = {}), "function" != typeof cb && err(7);
    const term = [], tAll = function() {
        for(let i = 0; i < term.length; ++i)term[i]();
    }, files = {};
    let cbd = function(a, b) {
        mt(function() {
            cb(a, b);
        });
    };
    mt(function() {
        cbd = cb;
    });
    let e = data.length - 22;
    for(; 101010256 !== b4(data, e); --e)if (!e || data.length - e > 65558) return cbd(err(13, 0, 1), null), tAll;
    let lft = b2(data, e + 8);
    if (lft) {
        let c = lft, o = b4(data, e + 16), z = 4294967295 === o || 65535 === c;
        if (z) {
            const ze = b4(data, e - 12);
            z = 101075792 === b4(data, ze), z && (c = lft = b4(data, ze + 32), o = b4(data, ze + 48));
        }
        const fltr = opts && opts.filter, _loop_3 = function() {
            const _a = zh(data, o, z), c_1 = _a[0], sc = _a[1], su = _a[2], fn = _a[3], no = _a[4], off = _a[5], b = slzh(data, off);
            o = no;
            const cbl = function(e, d) {
                e ? (tAll(), cbd(e, null)) : (d && (files[fn] = d), --lft || cbd(null, files));
            };
            if (!fltr || fltr({
                name: fn,
                size: sc,
                originalSize: su,
                compression: c_1
            })) if (c_1) if (8 === c_1) {
                const infl = data.subarray(b, b + sc);
                if (sc < 32e4) try {
                    cbl(null, inflateSync(infl, new u8(su)));
                } catch (e) {
                    cbl(e, null);
                }
                else term.push(inflate(infl, {
                    size: su
                }, cbl));
            } else cbl(err(14, "unknown compression type " + c_1, 1), null);
            else cbl(null, slc(data, b, b + sc));
            else cbl(null, null);
        };
        for(let i = 0; i < c; ++i)_loop_3(i);
    } else cbd(null, {});
    return tAll;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3N5c3RlbXMvY29yZS91dGlscy9Mb3R0aWVGZXRjaFV0aWxzL2ZmbGF0ZS5taW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBNSVQgTGljZW5zZVxuLy9cbi8vIENvcHlyaWdodCAoYykgMjAyMCBBcmp1biBCYXJyZXR0XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuLy8gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4vLyBTT0ZUV0FSRS5cbiAgY29uc3QgY2gyPXt9LHdrPWZ1bmN0aW9uKGMsaWQsbXNnLHRyYW5zZmVyLGNiKXtjb25zdCB3PW5ldyBXb3JrZXIoY2gyW2lkXXx8KGNoMltpZF09VVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbYysnO2FkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGZ1bmN0aW9uKGUpe2U9ZS5lcnJvcjtwb3N0TWVzc2FnZSh7JGUkOltlLm1lc3NhZ2UsZS5jb2RlLGUuc3RhY2tdfSl9KSddLHt0eXBlOlwidGV4dC9qYXZhc2NyaXB0XCJ9KSkpKTtyZXR1cm4gdy5vbm1lc3NhZ2U9ZnVuY3Rpb24oZSl7Y29uc3QgZD1lLmRhdGEsZWQ9ZC4kZSQ7aWYoZWQpe2NvbnN0IGVycj1uZXcgRXJyb3IoZWRbMF0pO2Vyci5jb2RlPWVkWzFdLGVyci5zdGFjaz1lZFsyXSxjYihlcnIsbnVsbCl9ZWxzZSBjYihudWxsLGQpfSx3LnBvc3RNZXNzYWdlKG1zZyx0cmFuc2Zlciksd30sdTg9VWludDhBcnJheSx1MTY9VWludDE2QXJyYXksdTMyPVVpbnQzMkFycmF5LGZsZWI9bmV3IHU4KFswLDAsMCwwLDAsMCwwLDAsMSwxLDEsMSwyLDIsMiwyLDMsMywzLDMsNCw0LDQsNCw1LDUsNSw1LDAsMCwwLDBdKSxmZGViPW5ldyB1OChbMCwwLDAsMCwxLDEsMiwyLDMsMyw0LDQsNSw1LDYsNiw3LDcsOCw4LDksOSwxMCwxMCwxMSwxMSwxMiwxMiwxMywxMywwLDBdKSxjbGltPW5ldyB1OChbMTYsMTcsMTgsMCw4LDcsOSw2LDEwLDUsMTEsNCwxMiwzLDEzLDIsMTQsMSwxNV0pLGZyZWI9ZnVuY3Rpb24oZWIsc3RhcnQpe2NvbnN0IGI9bmV3IHUxNigzMSk7Zm9yKHZhciBpPTA7aTwzMTsrK2kpYltpXT1zdGFydCs9MTw8ZWJbaS0xXTtjb25zdCByPW5ldyB1MzIoYlszMF0pO2ZvcihpPTE7aTwzMDsrK2kpZm9yKGxldCBqPWJbaV07ajxiW2krMV07KytqKXJbal09ai1iW2ldPDw1fGk7cmV0dXJuW2Iscl19LF9hPWZyZWIoZmxlYiwyKSxmbD1fYVswXSxyZXZmbD1fYVsxXTtmbFsyOF09MjU4LHJldmZsWzI1OF09Mjg7Y29uc3QgX2I9ZnJlYihmZGViLDApLGZkPV9iWzBdLHJldj1uZXcgdTE2KDMyNzY4KTtmb3IodmFyIGk9MDtpPDMyNzY4OysraSl7bGV0IHg9KDQzNjkwJmkpPj4+MXwoMjE4NDUmaSk8PDE7eD0oNTI0MjgmeCk+Pj4yfCgxMzEwNyZ4KTw8Mix4PSg2MTY4MCZ4KT4+PjR8KDM4NTUmeCk8PDQscmV2W2ldPSgoNjUyODAmeCk+Pj44fCgyNTUmeCk8PDgpPj4+MX1jb25zdCBoTWFwPWZ1bmN0aW9uKGNkLG1iLHIpe2NvbnN0IHM9Y2QubGVuZ3RoO2xldCBpPTA7Y29uc3QgbD1uZXcgdTE2KG1iKTtmb3IoO2k8czsrK2kpY2RbaV0mJisrbFtjZFtpXS0xXTtjb25zdCBsZT1uZXcgdTE2KG1iKTtmb3IoaT0wO2k8bWI7KytpKWxlW2ldPWxlW2ktMV0rbFtpLTFdPDwxO2xldCBjbztpZihyKXtjbz1uZXcgdTE2KDE8PG1iKTtjb25zdCBydmI9MTUtbWI7Zm9yKGk9MDtpPHM7KytpKWlmKGNkW2ldKXtjb25zdCBzdj1pPDw0fGNkW2ldLHJfMT1tYi1jZFtpXTtsZXQgdj1sZVtjZFtpXS0xXSsrPDxyXzE7Zm9yKGxldCBtPXZ8KDE8PHJfMSktMTt2PD1tOysrdiljb1tyZXZbdl0+Pj5ydmJdPXN2fX1lbHNlIGZvcihjbz1uZXcgdTE2KHMpLGk9MDtpPHM7KytpKWNkW2ldJiYoY29baV09cmV2W2xlW2NkW2ldLTFdKytdPj4+MTUtY2RbaV0pO3JldHVybiBjb30sZmx0PW5ldyB1OCgyODgpO2ZvcihpPTA7aTwxNDQ7KytpKWZsdFtpXT04O2ZvcihpPTE0NDtpPDI1NjsrK2kpZmx0W2ldPTk7Zm9yKGk9MjU2O2k8MjgwOysraSlmbHRbaV09Nztmb3IoaT0yODA7aTwyODg7KytpKWZsdFtpXT04O2NvbnN0IGZkdD1uZXcgdTgoMzIpO2ZvcihpPTA7aTwzMjsrK2kpZmR0W2ldPTU7Y29uc3QgZmxybT1oTWFwKGZsdCw5LDEpLGZkcm09aE1hcChmZHQsNSwxKSxtYXg9ZnVuY3Rpb24oYSl7bGV0IG09YVswXTtmb3IobGV0IGk9MTtpPGEubGVuZ3RoOysraSlhW2ldPm0mJihtPWFbaV0pO3JldHVybiBtfSxiaXRzPWZ1bmN0aW9uKGQscCxtKXtjb25zdCBvPXAvOHwwO3JldHVybihkW29dfGRbbysxXTw8OCk+Pig3JnApJm19LGJpdHMxNj1mdW5jdGlvbihkLHApe2NvbnN0IG89cC84fDA7cmV0dXJuKGRbb118ZFtvKzFdPDw4fGRbbysyXTw8MTYpPj4oNyZwKX0sc2hmdD1mdW5jdGlvbihwKXtyZXR1cm4ocCs3KS84fDB9LHNsYz1mdW5jdGlvbih2LHMsZSl7KG51bGw9PXN8fHM8MCkmJihzPTApLChudWxsPT1lfHxlPnYubGVuZ3RoKSYmKGU9di5sZW5ndGgpO2NvbnN0IG49bmV3KDI9PT12LkJZVEVTX1BFUl9FTEVNRU5UP3UxNjo0PT09di5CWVRFU19QRVJfRUxFTUVOVD91MzI6dTgpKGUtcyk7cmV0dXJuIG4uc2V0KHYuc3ViYXJyYXkocyxlKSksbn0sZWM9W1widW5leHBlY3RlZCBFT0ZcIixcImludmFsaWQgYmxvY2sgdHlwZVwiLFwiaW52YWxpZCBsZW5ndGgvbGl0ZXJhbFwiLFwiaW52YWxpZCBkaXN0YW5jZVwiLFwic3RyZWFtIGZpbmlzaGVkXCIsXCJubyBzdHJlYW0gaGFuZGxlclwiLCxcIm5vIGNhbGxiYWNrXCIsXCJpbnZhbGlkIFVURi04IGRhdGFcIixcImV4dHJhIGZpZWxkIHRvbyBsb25nXCIsXCJkYXRlIG5vdCBpbiByYW5nZSAxOTgwLTIwOTlcIixcImZpbGVuYW1lIHRvbyBsb25nXCIsXCJzdHJlYW0gZmluaXNoaW5nXCIsXCJpbnZhbGlkIHppcCBkYXRhXCJdO3ZhciBlcnI9ZnVuY3Rpb24oaW5kLG1zZyxudCl7Y29uc3QgZT1uZXcgRXJyb3IobXNnfHxlY1tpbmRdKTtpZihlLmNvZGU9aW5kLEVycm9yLmNhcHR1cmVTdGFja1RyYWNlJiZFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlLGVyciksIW50KXRocm93IGU7cmV0dXJuIGV9O2NvbnN0IGluZmx0PWZ1bmN0aW9uKGRhdCxidWYsc3Qpe2NvbnN0IHNsPWRhdC5sZW5ndGg7aWYoIXNsfHxzdCYmc3QuZiYmIXN0LmwpcmV0dXJuIGJ1Znx8bmV3IHU4KDApO2NvbnN0IG5vQnVmPSFidWZ8fHN0LG5vU3Q9IXN0fHxzdC5pO3N0fHwoc3Q9e30pLGJ1Znx8KGJ1Zj1uZXcgdTgoMypzbCkpO2NvbnN0IGNidWY9ZnVuY3Rpb24obCl7Y29uc3QgYmw9YnVmLmxlbmd0aDtpZihsPmJsKXtjb25zdCBuYnVmPW5ldyB1OChNYXRoLm1heCgyKmJsLGwpKTtuYnVmLnNldChidWYpLGJ1Zj1uYnVmfX07bGV0IGZpbmFsPXN0LmZ8fDAscG9zPXN0LnB8fDAsYnQ9c3QuYnx8MCxsbT1zdC5sLGRtPXN0LmQsbGJ0PXN0Lm0sZGJ0PXN0Lm47Y29uc3QgdGJ0cz04KnNsO2Rve2lmKCFsbSl7ZmluYWw9Yml0cyhkYXQscG9zLDEpO2NvbnN0IHR5cGU9Yml0cyhkYXQscG9zKzEsMyk7aWYocG9zKz0zLCF0eXBlKXtjb25zdCBsPWRhdFsocz1zaGZ0KHBvcykrNCktNF18ZGF0W3MtM108PDgsdD1zK2w7aWYodD5zbCl7bm9TdCYmZXJyKDApO2JyZWFrfW5vQnVmJiZjYnVmKGJ0K2wpLGJ1Zi5zZXQoZGF0LnN1YmFycmF5KHMsdCksYnQpLHN0LmI9YnQrPWwsc3QucD1wb3M9OCp0LHN0LmY9ZmluYWw7Y29udGludWV9aWYoMT09PXR5cGUpbG09ZmxybSxkbT1mZHJtLGxidD05LGRidD01O2Vsc2UgaWYoMj09PXR5cGUpe2NvbnN0IGhMaXQ9Yml0cyhkYXQscG9zLDMxKSsyNTcsaGNMZW49Yml0cyhkYXQscG9zKzEwLDE1KSs0LHRsPWhMaXQrYml0cyhkYXQscG9zKzUsMzEpKzE7cG9zKz0xNDtjb25zdCBsZHQ9bmV3IHU4KHRsKSxjbHQ9bmV3IHU4KDE5KTtmb3IodmFyIGk9MDtpPGhjTGVuOysraSljbHRbY2xpbVtpXV09Yml0cyhkYXQscG9zKzMqaSw3KTtwb3MrPTMqaGNMZW47Y29uc3QgY2xiPW1heChjbHQpLGNsYm1zaz0oMTw8Y2xiKS0xLGNsbT1oTWFwKGNsdCxjbGIsMSk7Zm9yKGk9MDtpPHRsOyl7Y29uc3Qgcj1jbG1bYml0cyhkYXQscG9zLGNsYm1zayldO3ZhciBzO2lmKHBvcys9MTUmciwocz1yPj4+NCk8MTYpbGR0W2krK109cztlbHNle3ZhciBjPTA7bGV0IG49MDtmb3IoMTY9PT1zPyhuPTMrYml0cyhkYXQscG9zLDMpLHBvcys9MixjPWxkdFtpLTFdKToxNz09PXM/KG49MytiaXRzKGRhdCxwb3MsNykscG9zKz0zKToxOD09PXMmJihuPTExK2JpdHMoZGF0LHBvcywxMjcpLHBvcys9Nyk7bi0tOylsZHRbaSsrXT1jfX1jb25zdCBsdD1sZHQuc3ViYXJyYXkoMCxoTGl0KTt2YXIgZHQ9bGR0LnN1YmFycmF5KGhMaXQpO2xidD1tYXgobHQpLGRidD1tYXgoZHQpLGxtPWhNYXAobHQsbGJ0LDEpLGRtPWhNYXAoZHQsZGJ0LDEpfWVsc2UgZXJyKDEpO2lmKHBvcz50YnRzKXtub1N0JiZlcnIoMCk7YnJlYWt9fW5vQnVmJiZjYnVmKGJ0KzEzMTA3Mik7Y29uc3QgbG1zPSgxPDxsYnQpLTEsZG1zPSgxPDxkYnQpLTE7bGV0IGxwb3M9cG9zO2Zvcig7O2xwb3M9cG9zKXtjb25zdCBzeW09KGM9bG1bYml0czE2KGRhdCxwb3MpJmxtc10pPj4+NDtpZihwb3MrPTE1JmMscG9zPnRidHMpe25vU3QmJmVycigwKTticmVha31pZihjfHxlcnIoMiksc3ltPDI1NilidWZbYnQrK109c3ltO2Vsc2V7aWYoMjU2PT09c3ltKXtscG9zPXBvcyxsbT1udWxsO2JyZWFrfXtsZXQgYWRkPXN5bS0yNTQ7aWYoc3ltPjI2NCl7dmFyIGI9ZmxlYltpPXN5bS0yNTddO2FkZD1iaXRzKGRhdCxwb3MsKDE8PGIpLTEpK2ZsW2ldLHBvcys9Yn1jb25zdCBkPWRtW2JpdHMxNihkYXQscG9zKSZkbXNdLGRzeW09ZD4+PjQ7ZHx8ZXJyKDMpLHBvcys9MTUmZDtkdD1mZFtkc3ltXTtpZihkc3ltPjMpe2I9ZmRlYltkc3ltXTtkdCs9Yml0czE2KGRhdCxwb3MpJigxPDxiKS0xLHBvcys9Yn1pZihwb3M+dGJ0cyl7bm9TdCYmZXJyKDApO2JyZWFrfW5vQnVmJiZjYnVmKGJ0KzEzMTA3Mik7Y29uc3QgZW5kPWJ0K2FkZDtmb3IoO2J0PGVuZDtidCs9NClidWZbYnRdPWJ1ZltidC1kdF0sYnVmW2J0KzFdPWJ1ZltidCsxLWR0XSxidWZbYnQrMl09YnVmW2J0KzItZHRdLGJ1ZltidCszXT1idWZbYnQrMy1kdF07YnQ9ZW5kfX19c3QubD1sbSxzdC5wPWxwb3Msc3QuYj1idCxzdC5mPWZpbmFsLGxtJiYoZmluYWw9MSxzdC5tPWxidCxzdC5kPWRtLHN0Lm49ZGJ0KX13aGlsZSghZmluYWwpO3JldHVybiBidD09PWJ1Zi5sZW5ndGg/YnVmOnNsYyhidWYsMCxidCl9LG1yZz1mdW5jdGlvbihhLGIpe2NvbnN0IG89e307Zm9yKHZhciBrIGluIGEpb1trXT1hW2tdO2Zvcih2YXIgayBpbiBiKW9ba109YltrXTtyZXR1cm4gb30sd2Nsbj1mdW5jdGlvbihmbixmblN0cix0ZCl7Y29uc3QgZHQ9Zm4oKSxzdD1mbi50b1N0cmluZygpLGtzPXN0LnNsaWNlKHN0LmluZGV4T2YoXCJbXCIpKzEsc3QubGFzdEluZGV4T2YoXCJdXCIpKS5yZXBsYWNlKC9cXHMrL2csXCJcIikuc3BsaXQoXCIsXCIpO2ZvcihsZXQgaT0wO2k8ZHQubGVuZ3RoOysraSl7Y29uc3Qgdj1kdFtpXSxrPWtzW2ldO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHYpe2ZuU3RyKz1cIjtcIitrK1wiPVwiO2NvbnN0IHN0XzE9di50b1N0cmluZygpO2lmKHYucHJvdG90eXBlKWlmKC0xIT09c3RfMS5pbmRleE9mKFwiW25hdGl2ZSBjb2RlXVwiKSl7Y29uc3Qgc3BJbmQ9c3RfMS5pbmRleE9mKFwiIFwiLDgpKzE7Zm5TdHIrPXN0XzEuc2xpY2Uoc3BJbmQsc3RfMS5pbmRleE9mKFwiKFwiLHNwSW5kKSl9ZWxzZXtmblN0cis9c3RfMTtmb3IoY29uc3QgdCBpbiB2LnByb3RvdHlwZSlmblN0cis9XCI7XCIraytcIi5wcm90b3R5cGUuXCIrdCtcIj1cIit2LnByb3RvdHlwZVt0XS50b1N0cmluZygpfWVsc2UgZm5TdHIrPXN0XzF9ZWxzZSB0ZFtrXT12fXJldHVybltmblN0cix0ZF19LGNoPVtdLGNiZnM9ZnVuY3Rpb24odil7Y29uc3QgdGw9W107Zm9yKGNvbnN0IGsgaW4gdil2W2tdLmJ1ZmZlciYmdGwucHVzaCgodltrXT1uZXcgdltrXS5jb25zdHJ1Y3Rvcih2W2tdKSkuYnVmZmVyKTtyZXR1cm4gdGx9LHdya3I9ZnVuY3Rpb24oZm5zLGluaXQsaWQsY2Ipe2xldCBfYTtpZighY2hbaWRdKXtsZXQgZm5TdHI9XCJcIix0ZF8xPXt9O2NvbnN0IG09Zm5zLmxlbmd0aC0xO2ZvcihsZXQgaT0wO2k8bTsrK2kpX2E9d2NsbihmbnNbaV0sZm5TdHIsdGRfMSksZm5TdHI9X2FbMF0sdGRfMT1fYVsxXTtjaFtpZF09d2NsbihmbnNbbV0sZm5TdHIsdGRfMSl9Y29uc3QgdGQ9bXJnKHt9LGNoW2lkXVsxXSk7cmV0dXJuIHdrKGNoW2lkXVswXStcIjtvbm1lc3NhZ2U9ZnVuY3Rpb24oZSl7Zm9yKHZhciBreiBpbiBlLmRhdGEpc2VsZltrel09ZS5kYXRhW2t6XTtvbm1lc3NhZ2U9XCIraW5pdC50b1N0cmluZygpK1wifVwiLGlkLHRkLGNiZnModGQpLGNiKX0sYkluZmx0PWZ1bmN0aW9uKCl7cmV0dXJuW3U4LHUxNix1MzIsZmxlYixmZGViLGNsaW0sZmwsZmQsZmxybSxmZHJtLHJldixlYyxoTWFwLG1heCxiaXRzLGJpdHMxNixzaGZ0LHNsYyxlcnIsaW5mbHQsaW5mbGF0ZVN5bmMscGJmLGd1OF19O3ZhciBwYmY9ZnVuY3Rpb24obXNnKXtyZXR1cm4gcG9zdE1lc3NhZ2UobXNnLFttc2cuYnVmZmVyXSl9LGd1OD1mdW5jdGlvbihvKXtyZXR1cm4gbyYmby5zaXplJiZuZXcgdTgoby5zaXplKX07Y29uc3QgY2JpZnk9ZnVuY3Rpb24oZGF0LG9wdHMsZm5zLGluaXQsaWQsY2Ipe3ZhciB3PXdya3IoZm5zLGluaXQsaWQsKGZ1bmN0aW9uKGVycixkYXQpe3cudGVybWluYXRlKCksY2IoZXJyLGRhdCl9KSk7cmV0dXJuIHcucG9zdE1lc3NhZ2UoW2RhdCxvcHRzXSxvcHRzLmNvbnN1bWU/W2RhdC5idWZmZXJdOltdKSxmdW5jdGlvbigpe3cudGVybWluYXRlKCl9fSxiMj1mdW5jdGlvbihkLGIpe3JldHVybiBkW2JdfGRbYisxXTw8OH0sYjQ9ZnVuY3Rpb24oZCxiKXtyZXR1cm4oZFtiXXxkW2IrMV08PDh8ZFtiKzJdPDwxNnxkW2IrM108PDI0KT4+PjB9O2Z1bmN0aW9uIGluZmxhdGUoZGF0YSxvcHRzLGNiKXtyZXR1cm4gY2J8fChjYj1vcHRzLG9wdHM9e30pLFwiZnVuY3Rpb25cIiE9dHlwZW9mIGNiJiZlcnIoNyksY2JpZnkoZGF0YSxvcHRzLFtiSW5mbHRdLChmdW5jdGlvbihldil7cmV0dXJuIHBiZihpbmZsYXRlU3luYyhldi5kYXRhWzBdLGd1OChldi5kYXRhWzFdKSkpfSksMSxjYil9ZnVuY3Rpb24gaW5mbGF0ZVN5bmMoZGF0YSxvdXQpe3JldHVybiBpbmZsdChkYXRhLG91dCl9Y29uc3QgdGQ9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyJiZuZXcgVGV4dERlY29kZXIsZHV0Zjg9ZnVuY3Rpb24oZCl7Zm9yKGxldCByPVwiXCIsaT0wOzspe2xldCBjPWRbaSsrXTtjb25zdCBlYj0oYz4xMjcpKyhjPjIyMykrKGM+MjM5KTtpZihpK2ViPmQubGVuZ3RoKXJldHVybltyLHNsYyhkLGktMSldO2ViPzM9PT1lYj8oYz0oKDE1JmMpPDwxOHwoNjMmZFtpKytdKTw8MTJ8KDYzJmRbaSsrXSk8PDZ8NjMmZFtpKytdKS02NTUzNixyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGM+PjEwLDU2MzIwfDEwMjMmYykpOnIrPTEmZWI/U3RyaW5nLmZyb21DaGFyQ29kZSgoMzEmYyk8PDZ8NjMmZFtpKytdKTpTdHJpbmcuZnJvbUNoYXJDb2RlKCgxNSZjKTw8MTJ8KDYzJmRbaSsrXSk8PDZ8NjMmZFtpKytdKTpyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGMpfX07ZXhwb3J0IGZ1bmN0aW9uIHN0ckZyb21VOChkYXQsbGF0aW4xKXtpZihsYXRpbjEpe2xldCByPVwiXCI7Zm9yKGxldCBpPTA7aTxkYXQubGVuZ3RoO2krPTE2Mzg0KXIrPVN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCxkYXQuc3ViYXJyYXkoaSxpKzE2Mzg0KSk7cmV0dXJuIHJ9aWYodGQpcmV0dXJuIHRkLmRlY29kZShkYXQpO3tjb25zdCBfYT1kdXRmOChkYXQpLG91dD1fYVswXTtyZXR1cm4gX2FbMV0ubGVuZ3RoJiZlcnIoOCksb3V0fX1jb25zdCBzbHpoPWZ1bmN0aW9uKGQsYil7cmV0dXJuIGIrMzArYjIoZCxiKzI2KStiMihkLGIrMjgpfSx6aD1mdW5jdGlvbihkLGIseil7Y29uc3QgZm5sPWIyKGQsYisyOCksZm49c3RyRnJvbVU4KGQuc3ViYXJyYXkoYis0NixiKzQ2K2ZubCksISgyMDQ4JmIyKGQsYis4KSkpLGVzPWIrNDYrZm5sLGJzPWI0KGQsYisyMCksX2E9eiYmNDI5NDk2NzI5NT09PWJzP3o2NGUoZCxlcyk6W2JzLGI0KGQsYisyNCksYjQoZCxiKzQyKV0sc2M9X2FbMF0sc3U9X2FbMV0sb2ZmPV9hWzJdO3JldHVybltiMihkLGIrMTApLHNjLHN1LGZuLGVzK2IyKGQsYiszMCkrYjIoZCxiKzMyKSxvZmZdfSxtdD1cImZ1bmN0aW9uXCI9PXR5cGVvZiBxdWV1ZU1pY3JvdGFzaz9xdWV1ZU1pY3JvdGFzazpcImZ1bmN0aW9uXCI9PXR5cGVvZiBzZXRUaW1lb3V0P3NldFRpbWVvdXQ6ZnVuY3Rpb24oZm4pe2ZuKCl9O2V4cG9ydCBmdW5jdGlvbiB1bnppcChkYXRhLG9wdHMsY2Ipe2NifHwoY2I9b3B0cyxvcHRzPXt9KSxcImZ1bmN0aW9uXCIhPXR5cGVvZiBjYiYmZXJyKDcpO2NvbnN0IHRlcm09W10sdEFsbD1mdW5jdGlvbigpe2ZvcihsZXQgaT0wO2k8dGVybS5sZW5ndGg7KytpKXRlcm1baV0oKX0sZmlsZXM9e307bGV0IGNiZD1mdW5jdGlvbihhLGIpe210KChmdW5jdGlvbigpe2NiKGEsYil9KSl9O210KChmdW5jdGlvbigpe2NiZD1jYn0pKTtsZXQgZT1kYXRhLmxlbmd0aC0yMjtmb3IoOzEwMTAxMDI1NiE9PWI0KGRhdGEsZSk7LS1lKWlmKCFlfHxkYXRhLmxlbmd0aC1lPjY1NTU4KXJldHVybiBjYmQoZXJyKDEzLDAsMSksbnVsbCksdEFsbDtsZXQgbGZ0PWIyKGRhdGEsZSs4KTtpZihsZnQpe2xldCBjPWxmdCxvPWI0KGRhdGEsZSsxNiksej00Mjk0OTY3Mjk1PT09b3x8NjU1MzU9PT1jO2lmKHope2NvbnN0IHplPWI0KGRhdGEsZS0xMik7ej0xMDEwNzU3OTI9PT1iNChkYXRhLHplKSx6JiYoYz1sZnQ9YjQoZGF0YSx6ZSszMiksbz1iNChkYXRhLHplKzQ4KSl9Y29uc3QgZmx0cj1vcHRzJiZvcHRzLmZpbHRlcixfbG9vcF8zPWZ1bmN0aW9uKCl7Y29uc3QgX2E9emgoZGF0YSxvLHopLGNfMT1fYVswXSxzYz1fYVsxXSxzdT1fYVsyXSxmbj1fYVszXSxubz1fYVs0XSxvZmY9X2FbNV0sYj1zbHpoKGRhdGEsb2ZmKTtvPW5vO2NvbnN0IGNibD1mdW5jdGlvbihlLGQpe2U/KHRBbGwoKSxjYmQoZSxudWxsKSk6KGQmJihmaWxlc1tmbl09ZCksLS1sZnR8fGNiZChudWxsLGZpbGVzKSl9O2lmKCFmbHRyfHxmbHRyKHtuYW1lOmZuLHNpemU6c2Msb3JpZ2luYWxTaXplOnN1LGNvbXByZXNzaW9uOmNfMX0pKWlmKGNfMSlpZig4PT09Y18xKXtjb25zdCBpbmZsPWRhdGEuc3ViYXJyYXkoYixiK3NjKTtpZihzYzwzMmU0KXRyeXtjYmwobnVsbCxpbmZsYXRlU3luYyhpbmZsLG5ldyB1OChzdSkpKX1jYXRjaChlKXtjYmwoZSxudWxsKX1lbHNlIHRlcm0ucHVzaChpbmZsYXRlKGluZmwse3NpemU6c3V9LGNibCkpfWVsc2UgY2JsKGVycigxNCxcInVua25vd24gY29tcHJlc3Npb24gdHlwZSBcIitjXzEsMSksbnVsbCk7ZWxzZSBjYmwobnVsbCxzbGMoZGF0YSxiLGIrc2MpKTtlbHNlIGNibChudWxsLG51bGwpfTtmb3IobGV0IGk9MDtpPGM7KytpKV9sb29wXzMoaSl9ZWxzZSBjYmQobnVsbCx7fSk7cmV0dXJuIHRBbGx9XG4iXSwibmFtZXMiOlsic3RyRnJvbVU4IiwidW56aXAiLCJjaDIiLCJ3ayIsImMiLCJpZCIsIm1zZyIsInRyYW5zZmVyIiwiY2IiLCJ3IiwiV29ya2VyIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiQmxvYiIsInR5cGUiLCJvbm1lc3NhZ2UiLCJlIiwiZCIsImRhdGEiLCJlZCIsIiRlJCIsImVyciIsIkVycm9yIiwiY29kZSIsInN0YWNrIiwicG9zdE1lc3NhZ2UiLCJ1OCIsIlVpbnQ4QXJyYXkiLCJ1MTYiLCJVaW50MTZBcnJheSIsInUzMiIsIlVpbnQzMkFycmF5IiwiZmxlYiIsImZkZWIiLCJjbGltIiwiZnJlYiIsImViIiwic3RhcnQiLCJiIiwiaSIsInIiLCJqIiwiX2EiLCJmbCIsInJldmZsIiwiX2IiLCJmZCIsInJldiIsIngiLCJoTWFwIiwiY2QiLCJtYiIsInMiLCJsZW5ndGgiLCJsIiwibGUiLCJjbyIsInJ2YiIsInN2Iiwicl8xIiwidiIsIm0iLCJmbHQiLCJmZHQiLCJmbHJtIiwiZmRybSIsIm1heCIsImEiLCJiaXRzIiwicCIsIm8iLCJiaXRzMTYiLCJzaGZ0Iiwic2xjIiwibiIsIkJZVEVTX1BFUl9FTEVNRU5UIiwic2V0Iiwic3ViYXJyYXkiLCJlYyIsImluZCIsIm50IiwiY2FwdHVyZVN0YWNrVHJhY2UiLCJpbmZsdCIsImRhdCIsImJ1ZiIsInN0Iiwic2wiLCJmIiwibm9CdWYiLCJub1N0IiwiY2J1ZiIsImJsIiwibmJ1ZiIsIk1hdGgiLCJmaW5hbCIsInBvcyIsImJ0IiwibG0iLCJkbSIsImxidCIsImRidCIsInRidHMiLCJ0IiwiaExpdCIsImhjTGVuIiwidGwiLCJsZHQiLCJjbHQiLCJjbGIiLCJjbGJtc2siLCJjbG0iLCJsdCIsImR0IiwibG1zIiwiZG1zIiwibHBvcyIsInN5bSIsImFkZCIsImRzeW0iLCJlbmQiLCJtcmciLCJrIiwid2NsbiIsImZuIiwiZm5TdHIiLCJ0ZCIsInRvU3RyaW5nIiwia3MiLCJzbGljZSIsImluZGV4T2YiLCJsYXN0SW5kZXhPZiIsInJlcGxhY2UiLCJzcGxpdCIsInN0XzEiLCJwcm90b3R5cGUiLCJzcEluZCIsImNoIiwiY2JmcyIsImJ1ZmZlciIsInB1c2giLCJjb25zdHJ1Y3RvciIsIndya3IiLCJmbnMiLCJpbml0IiwidGRfMSIsImJJbmZsdCIsImluZmxhdGVTeW5jIiwicGJmIiwiZ3U4Iiwic2l6ZSIsImNiaWZ5Iiwib3B0cyIsInRlcm1pbmF0ZSIsImNvbnN1bWUiLCJiMiIsImI0IiwiaW5mbGF0ZSIsImV2Iiwib3V0IiwiVGV4dERlY29kZXIiLCJkdXRmOCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImxhdGluMSIsImFwcGx5IiwiZGVjb2RlIiwic2x6aCIsInpoIiwieiIsImZubCIsImVzIiwiYnMiLCJ6NjRlIiwic2MiLCJzdSIsIm9mZiIsIm10IiwicXVldWVNaWNyb3Rhc2siLCJzZXRUaW1lb3V0IiwidGVybSIsInRBbGwiLCJmaWxlcyIsImNiZCIsImxmdCIsInplIiwiZmx0ciIsImZpbHRlciIsIl9sb29wXzMiLCJjXzEiLCJubyIsImNibCIsIm5hbWUiLCJvcmlnaW5hbFNpemUiLCJjb21wcmVzc2lvbiIsImluZmwiXSwibWFwcGluZ3MiOiJBQUNBLGNBQWM7QUFDZCxFQUFFO0FBQ0YsbUNBQW1DO0FBQ25DLEVBQUU7QUFDRiwrRUFBK0U7QUFDL0UsZ0ZBQWdGO0FBQ2hGLCtFQUErRTtBQUMvRSw0RUFBNEU7QUFDNUUsd0VBQXdFO0FBQ3hFLDJEQUEyRDtBQUMzRCxFQUFFO0FBQ0YsaUZBQWlGO0FBQ2pGLGtEQUFrRDtBQUNsRCxFQUFFO0FBQ0YsNkVBQTZFO0FBQzdFLDJFQUEyRTtBQUMzRSw4RUFBOEU7QUFDOUUseUVBQXlFO0FBQ3pFLGdGQUFnRjtBQUNoRixnRkFBZ0Y7QUFDaEYsWUFBWTs7Ozs7Ozs7Ozs7O0lBQ21pT0EsU0FBUztlQUFUQTs7SUFBc3JCQyxLQUFLO2VBQUxBOzs7QUFBbnVQLE1BQU1DLE1BQUksQ0FBQyxHQUFFQyxLQUFHLFNBQVNDLENBQUMsRUFBQ0MsRUFBRSxFQUFDQyxHQUFHLEVBQUNDLFFBQVEsRUFBQ0MsRUFBRTtJQUFFLE1BQU1DLElBQUUsSUFBSUMsT0FBT1IsR0FBRyxDQUFDRyxHQUFHLElBQUdILENBQUFBLEdBQUcsQ0FBQ0csR0FBRyxHQUFDTSxJQUFJQyxlQUFlLENBQUMsSUFBSUMsS0FBSztRQUFDVCxJQUFFO0tBQWtHLEVBQUM7UUFBQ1UsTUFBSztJQUFpQixHQUFFO0lBQUksT0FBT0wsRUFBRU0sU0FBUyxHQUFDLFNBQVNDLENBQUM7UUFBRSxNQUFNQyxJQUFFRCxFQUFFRSxJQUFJLEVBQUNDLEtBQUdGLEVBQUVHLEdBQUc7UUFBQyxJQUFHRCxJQUFHO1lBQUMsTUFBTUUsTUFBSSxJQUFJQyxNQUFNSCxFQUFFLENBQUMsRUFBRTtZQUFFRSxJQUFJRSxJQUFJLEdBQUNKLEVBQUUsQ0FBQyxFQUFFLEVBQUNFLElBQUlHLEtB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

}),
7933: (function (__unused_webpack_module, exports, __webpack_require__) {
/* eslint-env browser */ // Borrowed from https://github.com/reslear/dotlottie-player-core/blob/ab9ab866df3f6687111f9317189b83b66c0d19f8/src/fetch.ts#L62
//
// MIT License
//
// Copyright (c) 2022 reslear
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    fetchLottie: function() {
        return fetchLottie;
    },
    unZipDotLottie: function() {
        return unZipDotLottie;
    }
});
const _fflatemin = __webpack_require__(3487);
function parseManifest(data) {
    const manifest = JSON.parse(data);
    if (!('animations' in manifest)) {
        throw new Error('Manifest not found');
    }
    if (manifest.animations.length === 0) {
        throw new Error('No animations listed in the manifest');
    }
    return manifest;
}
function isBytesZip(bytes) {
    // lottie file is a zip file format https://en.wikipedia.org/wiki/List_of_file_signatures
    // @see https://stackoverflow.com/a/66046176
    const b = new Uint8Array(bytes, 0, 32);
    return b[0] === 80 && b[1] === 75 && b[2] === 3 && b[3] === 4;
}
async function fetchRequest(url) {
    return await fetch(new URL(url, window?.location?.href).href).then((r)=>r.arrayBuffer());
}
async function base64fromU8(data) {
    const base64url = await new Promise((resolve)=>{
        const reader = new FileReader();
        // @ts-expect-error - TS2322 - Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BlobPart'.
        reader.readAsDataURL(new Blob([
            data
        ]));
        reader.onload = ()=>resolve(reader.result);
    });
    // @ts-expect-error - TS2322 - Type 'string | undefined' is not assignable to type 'string'.
    return base64url.split(',', 2)[1];
}
async function unZip(buffer) {
    const file = new Uint8Array(buffer);
    const lottieFile = await new Promise((resolve, reject)=>{
        (0, _fflatemin.unzip)(file, (err, unzipped)=>err ? reject(err) : resolve(unzipped));
    });
    return {
        // @ts-expect-error - TS2322 - Type 'string | Uint8Array | Uint16Array | Uint32Array' is not assignable to type 'string'.
        read: (path)=>(0, _fflatemin.strFromU8)(lottieFile[path]),
        readB64: async (path)=>await base64fromU8(lottieFile[path])
    };
}
async function prepareLottieAssets(lottieJson, dotLottie) {
    if (!('assets' in lottieJson)) {
        return lottieJson;
    }
    async function parseAsset(asset) {
        const { p } = asset;
        if (p == null) return asset;
        if (dotLottie.read(`images/${p}`) == null) return asset;
        const ext = p.split('.').pop();
        const assetB64 = await dotLottie.readB64(`images/${p}`);
        // Handles assets that are encoded directly in the JSON
        if (ext?.startsWith('data:')) {
            asset.p = ext;
            asset.e = 1;
            return asset;
        }
        switch(ext){
            case 'svg':
            case 'svg+xml':
                asset.p = `data:image/svg+xml;base64,${assetB64}`;
                break;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
                asset.p = `data:image/${ext};base64,${assetB64}`;
                break;
            default:
                asset.p = `data:;base64,${assetB64}`;
        }
        asset.e = 1;
        return asset;
    }
    const result = await Promise.all(lottieJson.assets.map(parseAsset));
    result.map((asset, i)=>{
        lottieJson.assets[i] = asset;
    });
    return lottieJson;
}
async function unZipDotLottie(response) {
    const dotLottie = await unZip(response);
    const manifest = parseManifest(dotLottie.read('manifest.json'));
    const animations = await Promise.all(manifest.animations.map((a)=>{
        const lottieJson = JSON.parse(dotLottie.read(`animations/${a.id}.json`));
        return prepareLottieAssets(lottieJson, dotLottie);
    }));
    // @ts-expect-error - TS2322 - Type 'LottieJson | undefined' is not assignable to type 'LottieJson'.
    return animations[0];
}
async function fetchLottie(url) {
    const response = await fetchRequest(url);
    if (isBytesZip(response)) {
        return await unZipDotLottie(response);
    }
    const lottieJson = JSON.parse(new TextDecoder().decode(response));
    return lottieJson;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3N5c3RlbXMvY29yZS91dGlscy9Mb3R0aWVGZXRjaFV0aWxzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuXG4vLyBCb3Jyb3dlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9yZXNsZWFyL2RvdGxvdHRpZS1wbGF5ZXItY29yZS9ibG9iL2FiOWFiODY2ZGYzZjY2ODcxMTFmOTMxNzE4OWI4M2I2NmMwZDE5Zjgvc3JjL2ZldGNoLnRzI0w2MlxuLy9cbi8vIE1JVCBMaWNlbnNlXG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDIyIHJlc2xlYXJcbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4vLyBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbi8vIFNPRlRXQVJFLlxuXG5pbXBvcnQge3VuemlwLCBzdHJGcm9tVTh9IGZyb20gJy4vZmZsYXRlLm1pbic7XG5pbXBvcnQgdHlwZSB7RG90TG90dGllTWFuaWZlc3QsIExvdHRpZUpzb25Bc3NldCwgTG90dGllSnNvbn0gZnJvbSAnLi90eXBlcyc7XG5cbmZ1bmN0aW9uIHBhcnNlTWFuaWZlc3QoZGF0YTogc3RyaW5nKTogRG90TG90dGllTWFuaWZlc3Qge1xuICBjb25zdCBtYW5pZmVzdDogRG90TG90dGllTWFuaWZlc3QgPSBKU09OLnBhcnNlKGRhdGEpO1xuICBpZiAoISgnYW5pbWF0aW9ucycgaW4gbWFuaWZlc3QpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNYW5pZmVzdCBub3QgZm91bmQnKTtcbiAgfVxuICBpZiAobWFuaWZlc3QuYW5pbWF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGFuaW1hdGlvbnMgbGlzdGVkIGluIHRoZSBtYW5pZmVzdCcpO1xuICB9XG4gIHJldHVybiBtYW5pZmVzdDtcbn1cblxuZnVuY3Rpb24gaXNCeXRlc1ppcChieXRlczogQXJyYXlCdWZmZXIpOiBib29sZWFuIHtcbiAgLy8gbG90dGllIGZpbGUgaXMgYSB6aXAgZmlsZSBmb3JtYXQgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl9maWxlX3NpZ25hdHVyZXNcbiAgLy8gQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNjYwNDYxNzZcbiAgY29uc3QgYiA9IG5ldyBVaW50OEFycmF5KGJ5dGVzLCAwLCAzMik7XG4gIHJldHVybiBiWzBdID09PSA4MCAmJiBiWzFdID09PSA3NSAmJiBiWzJdID09PSAzICYmIGJbM10gPT09IDQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZldGNoUmVxdWVzdCh1cmw6IHN0cmluZyk6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgcmV0dXJuIGF3YWl0IGZldGNoKG5ldyBVUkwodXJsLCB3aW5kb3c/LmxvY2F0aW9uPy5ocmVmKS5ocmVmKS50aGVuKChyKSA9PlxuICAgIHIuYXJyYXlCdWZmZXIoKVxuICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBiYXNlNjRmcm9tVTgoZGF0YTogVWludDhBcnJheSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IGJhc2U2NHVybCA9IGF3YWl0IG5ldyBQcm9taXNlKFxuICAgIChcbiAgICAgIHJlc29sdmU6IChcbiAgICAgICAgcmVzdWx0OlxuICAgICAgICAgIHwgUHJvbWlzZTxudWxsIHwgQXJyYXlCdWZmZXIgfCBzdHJpbmc+XG4gICAgICAgICAgfCBudWxsXG4gICAgICAgICAgfCBBcnJheUJ1ZmZlclxuICAgICAgICAgIHwgc3RyaW5nXG4gICAgICApID0+IHZvaWRcbiAgICApID0+IHtcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVFMyMzIyIC0gVHlwZSAnVWludDhBcnJheTxBcnJheUJ1ZmZlckxpa2U+JyBpcyBub3QgYXNzaWduYWJsZSB0byB0eXBlICdCbG9iUGFydCcuXG4gICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChuZXcgQmxvYihbZGF0YV0pKTtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKHJlYWRlci5yZXN1bHQpO1xuICAgIH1cbiAgKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVFMyMzIyIC0gVHlwZSAnc3RyaW5nIHwgdW5kZWZpbmVkJyBpcyBub3QgYXNzaWduYWJsZSB0byB0eXBlICdzdHJpbmcnLlxuICByZXR1cm4gKGJhc2U2NHVybCBhcyBzdHJpbmcpLnNwbGl0KCcsJywgMilbMV07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHVuWmlwKGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiBQcm9taXNlPHtcbiAgcmVhZDogKGFyZzE6IHN0cmluZykgPT4gc3RyaW5nO1xuICByZWFkQjY0OiAoYXJnMTogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZz47XG59PiB7XG4gIGNvbnN0IGZpbGUgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICBjb25zdCBsb3R0aWVGaWxlID0gYXdhaXQgbmV3IFByb21pc2UoXG4gICAgKFxuICAgICAgcmVzb2x2ZTogKHJlc3VsdDogUHJvbWlzZTxuZXZlcj4pID0+IHZvaWQsXG4gICAgICByZWplY3Q6IChlcnJvcj86IEVycm9yKSA9PiB2b2lkXG4gICAgKSA9PiB7XG4gICAgICB1bnppcChmaWxlLCAoZXJyOiBFcnJvciwgdW56aXBwZWQ6IGFueSkgPT5cbiAgICAgICAgZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKHVuemlwcGVkKVxuICAgICAgKTtcbiAgICB9XG4gICk7XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVFMyMzIyIC0gVHlwZSAnc3RyaW5nIHwgVWludDhBcnJheSB8IFVpbnQxNkFycmF5IHwgVWludDMyQXJyYXknIGlzIG5vdCBhc3NpZ25hYmxlIHRvIHR5cGUgJ3N0cmluZycuXG4gICAgcmVhZDogKHBhdGgpID0+IHN0ckZyb21VOChsb3R0aWVGaWxlW3BhdGhdKSxcbiAgICByZWFkQjY0OiBhc3luYyAocGF0aCkgPT4gYXdhaXQgYmFzZTY0ZnJvbVU4KGxvdHRpZUZpbGVbcGF0aF0pLFxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBwcmVwYXJlTG90dGllQXNzZXRzKFxuICBsb3R0aWVKc29uOiBMb3R0aWVKc29uLFxuICBkb3RMb3R0aWU6IHtcbiAgICByZWFkOiAoYXJnMTogc3RyaW5nKSA9PiBzdHJpbmc7XG4gICAgcmVhZEI2NDogKGFyZzE6IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmc+O1xuICB9XG4pIHtcbiAgaWYgKCEoJ2Fzc2V0cycgaW4gbG90dGllSnNvbikpIHtcbiAgICByZXR1cm4gbG90dGllSnNvbjtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHBhcnNlQXNzZXQoYXNzZXQ6IExvdHRpZUpzb25Bc3NldCkge1xuICAgIGNvbnN0IHtwfSA9IGFzc2V0O1xuXG4gICAgaWYgKHAgPT0gbnVsbCkgcmV0dXJuIGFzc2V0O1xuICAgIGlmIChkb3RMb3R0aWUucmVhZChgaW1hZ2VzLyR7cH1gKSA9PSBudWxsKSByZXR1cm4gYXNzZXQ7XG5cbiAgICBjb25zdCBleHQgPSBwLnNwbGl0KCcuJykucG9wKCk7XG4gICAgY29uc3QgYXNzZXRCNjQgPSBhd2FpdCBkb3RMb3R0aWUucmVhZEI2NChgaW1hZ2VzLyR7cH1gKTtcblxuICAgIC8vIEhhbmRsZXMgYXNzZXRzIHRoYXQgYXJlIGVuY29kZWQgZGlyZWN0bHkgaW4gdGhlIEpTT05cbiAgICBpZiAoZXh0Py5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgICBhc3NldC5wID0gZXh0O1xuICAgICAgYXNzZXQuZSA9IDE7XG4gICAgICByZXR1cm4gYXNzZXQ7XG4gICAgfVxuXG4gICAgc3dpdGNoIChleHQpIHtcbiAgICAgIGNhc2UgJ3N2Zyc6XG4gICAgICBjYXNlICdzdmcreG1sJzpcbiAgICAgICAgYXNzZXQucCA9IGBkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LCR7YXNzZXRCNjR9YDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwbmcnOlxuICAgICAgY2FzZSAnanBnJzpcbiAgICAgIGNhc2UgJ2pwZWcnOlxuICAgICAgY2FzZSAnZ2lmJzpcbiAgICAgIGNhc2UgJ3dlYnAnOlxuICAgICAgICBhc3NldC5wID0gYGRhdGE6aW1hZ2UvJHtleHR9O2Jhc2U2NCwke2Fzc2V0QjY0fWA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXQucCA9IGBkYXRhOjtiYXNlNjQsJHthc3NldEI2NH1gO1xuICAgIH1cblxuICAgIGFzc2V0LmUgPSAxO1xuXG4gICAgcmV0dXJuIGFzc2V0O1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5hbGwobG90dGllSnNvbi5hc3NldHMubWFwKHBhcnNlQXNzZXQpKTtcblxuICByZXN1bHQubWFwKChhc3NldCwgaSkgPT4ge1xuICAgIGxvdHRpZUpzb24uYXNzZXRzW2ldID0gYXNzZXQ7XG4gIH0pO1xuXG4gIHJldHVybiBsb3R0aWVKc29uO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgYC5sb3R0aWVgIGZpbGUgYXMgYW4gYXJyYXkgYnVmZmVyLCBgdW5aaXBEb3RMb3R0aWVgIHVuemlwcyB0aGUgZmlsZSxcbiAqIHBhcnNlcyB0aGUgYXNzZXRzLCBhbmQgdGhlbiByZXR1cm5zIHRoZSBwYXJzZWQgbG90dGllIEpTT04gZmlsZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVuWmlwRG90TG90dGllKFxuICByZXNwb25zZTogQXJyYXlCdWZmZXJcbik6IFByb21pc2U8TG90dGllSnNvbj4ge1xuICBjb25zdCBkb3RMb3R0aWUgPSBhd2FpdCB1blppcChyZXNwb25zZSk7XG4gIGNvbnN0IG1hbmlmZXN0ID0gcGFyc2VNYW5pZmVzdChkb3RMb3R0aWUucmVhZCgnbWFuaWZlc3QuanNvbicpKTtcbiAgY29uc3QgYW5pbWF0aW9ucyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgIG1hbmlmZXN0LmFuaW1hdGlvbnMubWFwKChhKSA9PiB7XG4gICAgICBjb25zdCBsb3R0aWVKc29uID0gSlNPTi5wYXJzZShkb3RMb3R0aWUucmVhZChgYW5pbWF0aW9ucy8ke2EuaWR9Lmpzb25gKSk7XG4gICAgICByZXR1cm4gcHJlcGFyZUxvdHRpZUFzc2V0cyhsb3R0aWVKc29uLCBkb3RMb3R0aWUpO1xuICAgIH0pXG4gICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRTMjMyMiAtIFR5cGUgJ0xvdHRpZUpzb24gfCB1bmRlZmluZWQnIGlzIG5vdCBhc3NpZ25hYmxlIHRvIHR5cGUgJ0xvdHRpZUpzb24nLlxuICByZXR1cm4gYW5pbWF0aW9uc1swXTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIFVSTCBwYXRoLCBgZmV0Y2hMb3R0aWVgIGZldGNoZXMgYSBgLmxvdHRpZWAgZmlsZSwgdW56aXBzIHRoZSBmaWxlLCBwYXJzZXMgdGhlIGFzc2V0cyxcbiAqIGFuZCB0aGVuIHJldHVybnMgdGhlIHBhcnNlZCBsb3R0aWUgSlNPTi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoTG90dGllKHVybDogc3RyaW5nKTogUHJvbWlzZTxMb3R0aWVKc29uPiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hSZXF1ZXN0KHVybCk7XG5cbiAgaWYgKGlzQnl0ZXNaaXAocmVzcG9uc2UpKSB7XG4gICAgcmV0dXJuIGF3YWl0IHVuWmlwRG90TG90dGllKHJlc3BvbnNlKTtcbiAgfVxuXG4gIGNvbnN0IGxvdHRpZUpzb24gPSBKU09OLnBhcnNlKFxuICAgIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShyZXNwb25zZSlcbiAgKSBhcyBMb3R0aWVKc29uO1xuICByZXR1cm4gbG90dGllSnNvbjtcbn1cbiJdLCJuYW1lcyI6WyJmZXRjaExvdHRpZSIsInVuWmlwRG90TG90dGllIiwicGFyc2VNYW5pZmVzdCIsImRhdGEiLCJtYW5pZmVzdCIsIkpTT04iLCJwYXJzZSIsIkVycm9yIiwiYW5pbWF0aW9ucyIsImxlbmd0aCIsImlzQnl0ZXNaaXAiLCJieXRlcyIsImIiLCJVaW50OEFycmF5IiwiZmV0Y2hSZXF1ZXN0IiwidXJsIiwiZmV0Y2giLCJVUkwiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhyZWYiLCJ0aGVuIiwiciIsImFycmF5QnVmZmVyIiwiYmFzZTY0ZnJvbVU4IiwiYmFzZTY0dXJsIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwicmVhZEFzRGF0YVVSTCIsIkJsb2IiLCJvbmxvYWQiLCJyZXN1bHQiLCJzcGxpdCIsInVuWmlwIiwiYnVmZmVyIiwiZmlsZSIsImxvdHRpZUZpbGUiLCJyZWplY3QiLCJ1bnppcCIsImVyciIsInVuemlwcGVkIiwicmVhZCIsInBhdGgiLCJzdHJGcm9tVTgiLCJyZWFkQjY0IiwicHJlcGFyZUxvdHRpZUFzc2V0cyIsImxvdHRpZUpzb24iLCJkb3RMb3R0aWUiLCJwYXJzZUFzc2V0IiwiYXNzZXQiLCJwIiwiZXh0IiwicG9wIiwiYXNzZXRCNjQiLCJzdGFydHNXaXRoIiwiZSIsImFsbCIsImFzc2V0cyIsIm1hcCIsImkiLCJyZXNwb25zZSIsImEiLCJpZCIsIlRleHREZWNvZGVyIiwiZGVjb2RlIl0sIm1hcHBpbmdzIjoiQUFBQSxzQkFBc0IsR0FFdEIsZ0lBQWdJO0FBQ2hJLEVBQUU7QUFDRixjQUFjO0FBQ2QsRUFBRTtBQUNGLDZCQUE2QjtBQUM3QixFQUFFO0FBQ0YsK0VBQStFO0FBQy9FLGdGQUFnRjtBQUNoRiwrRUFBK0U7QUFDL0UsNEVBQTRFO0FBQzVFLHdFQUF3RTtBQUN4RSwyREFBMkQ7QUFDM0QsRUFBRTtBQUNGLGlGQUFpRjtBQUNqRixrREFBa0Q7QUFDbEQsRUFBRTtBQUNGLDZFQUE2RTtBQUM3RSwyRUFBMkU7QUFD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

}),

}]);