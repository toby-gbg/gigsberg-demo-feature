'use client';

import {
    SpotifyCheckoutStartedPayload,
    SpotifyCheckoutSuccessfulPayload,
} from '@/interfaces/spotify/SpotifyAd';

/**
 * This class use for handle action for any Analytics Services
 */
export default class SpotifyAdTracker {
    static trackCheckoutStarted(payload: SpotifyCheckoutStartedPayload) {
        if (!window.spdt) return;
        window.spdt('checkout', payload);
    }

    static trackCheckoutSuccessful(payload: SpotifyCheckoutSuccessfulPayload) {
        if (!window.spdt) return;
        window.spdt('purchase', payload);
    }
}
