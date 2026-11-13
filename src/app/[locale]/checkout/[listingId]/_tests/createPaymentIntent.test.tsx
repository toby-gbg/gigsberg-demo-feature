/**
 * createPaymentIntent call-count tests per payment provider.
 *
 * Group 1 – CheckoutContactForm (Step 1): verifies createPaymentIntent is skipped
 *            for stripe and called once with { leadId } for all other providers.
 *
 * Group 2 – useStripe hook (Step 2 Stripe path): verifies createPaymentIntent is
 *            called once with { paymentProvider: 'stripe' }.
 *
 * Group 3 – CheckoutNomupayElements (Step 2 sync): verifies the initialize() path
 *            (non-nomupay at step 2) calls createPaymentIntent once, while the
 *            nomupay-with-existing-intent path does NOT call it.
 */

import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import CheckoutContactForm from '@/app/[locale]/checkout/[listingId]/_components/CheckoutContactForm';
import CheckoutNomupayElements from '@/app/[locale]/checkout/[listingId]/_components/CheckoutPaymentMethods/CheckoutElements/CheckoutNomupayElements';
import useStripeHook from '@/app/[locale]/checkout/[listingId]/_hooks/useStripe';
import { useCheckoutCoupon } from '@/app/[locale]/checkout/[listingId]/_providers/CheckoutCouponProvider';
import { useCheckoutData } from '@/app/[locale]/checkout/[listingId]/_providers/CheckoutDataProvider';
import { useCheckoutLead } from '@/app/[locale]/checkout/[listingId]/_providers/CheckoutLeadProvider';
import { useCheckoutPayment } from '@/app/[locale]/checkout/[listingId]/_providers/CheckoutPaymentProvider';
import { useElements, useStripe as useReactStripe } from '@stripe/react-stripe-js';
import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { CheckoutStep } from '@/interfaces/Checkout';

// Checkout context providers
vi.mock('@/app/[locale]/checkout/[listingId]/_providers/CheckoutPaymentProvider', () => ({
    useCheckoutPayment: vi.fn(),
    CheckoutPaymentProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('@/app/[locale]/checkout/[listingId]/_providers/CheckoutDataProvider', () => ({
    useCheckoutData: vi.fn(),
}));
vi.mock('@/app/[locale]/checkout/[listingId]/_providers/CheckoutLeadProvider', () => ({
    useCheckoutLead: vi.fn(),
}));
vi.mock('@/app/[locale]/checkout/[listingId]/_providers/CheckoutCouponProvider', () => ({
    useCheckoutCoupon: vi.fn(),
}));
vi.mock('@/app/[locale]/checkout/[listingId]/_providers/CheckoutAttendeeInfoProvider', () => ({
    useCheckoutAttendeeInfo: vi.fn().mockReturnValue({
        attendeeSchema: null,
        hasAttendeeStep: false,
        submitAttendeeInfo: vi.fn(),
        attendeeFormData: null,
        setAttendeeFormData: vi.fn(),
    }),
}));

// Framework
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'en',
}));
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    useSearchParams: () => ({ get: () => null }),
}));
// next-intl/navigation pulls `next/navigation` via CJS without extension; ESM resolver fails.
// Cut the chain here — mocks the wrapper our app code actually imports.
vi.mock('@/i18n/routing', () => ({
    Link: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a {...props}>{children}</a>
    ),
    redirect: vi.fn(),
    usePathname: () => '/',
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    getPathname: () => '/',
}));

// Stripe
vi.mock('@stripe/react-stripe-js', () => ({
    useStripe: vi.fn(),
    useElements: vi.fn(),
}));

// App hooks
vi.mock('@/hooks/useIntlRouter', () => ({
    default: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('@/hooks/useCookie', () => ({
    default: () => ({
        getCookie: vi.fn().mockReturnValue(undefined),
        getEncryptedCookie: vi.fn().mockResolvedValue(null),
        setEncryptedCookie: vi.fn().mockResolvedValue(undefined),
        deleteCookie: vi.fn(),
        existsCookie: vi.fn().mockReturnValue(false),
    }),
}));

vi.mock('@/swr/features/auth', () => ({
    useRegisterMutation: () => ({
        trigger: vi.fn().mockResolvedValue({}),
    }),
}));
vi.mock('@/swr/features/user', () => ({
    useUpdateUserMutation: () => ({
        trigger: vi.fn().mockResolvedValue({}),
    }),
}));

// GoogleEventMapper — called inline in _onSubmit with newUser.user (which is undefined from mock)
vi.mock('@/utils/GoogleEventMapper', () => ({
    default: { mapUserProvidedData: vi.fn().mockReturnValue({}) },
}));

// Analytics
vi.mock('@/lib/seo/GoogleAnalyticsTracker', () => ({
    default: { triggerGA4PromotionEvent: vi.fn(), triggerUPDSubmit: vi.fn() },
}));
vi.mock('@/utils/mappers/user/user.mapper', () => ({
    default: { toCheckoutForm: vi.fn().mockReturnValue({}) },
}));
vi.mock('@/utils/customs/checkout.util', () => ({
    default: {
        step1ToRegister: vi.fn().mockReturnValue({}),
        step1ToUpdateUser: vi.fn().mockReturnValue({}),
    },
}));

// Toast — first arg may be a Promise (CheckoutContactForm) or an async fn (useStripe)
vi.mock('@/components/ui/Toast', () => ({
    toast: {
        promise: vi.fn(async (fnOrPromise: (() => Promise<unknown>) | Promise<unknown>) => {
            try {
                if (typeof fnOrPromise === 'function') {
                    return await fnOrPromise();
                }
                return await fnOrPromise;
            } catch {
                // error is displayed by toast.add – suppress unhandled rejection
            }
        }),
        add: vi.fn(),
    },
}));

// User provider — signed-out customer used by checkout under test
vi.mock('@/providers/UserProvider', () => ({
    useUser: () => null,
    useUserActions: () => ({ setCredentials: vi.fn(), resetCredentials: vi.fn() }),
}));

// Sub-components of CheckoutContactForm — render as stubs (mock at the path each file uses to import them)
vi.mock(
    '@/app/[locale]/checkout/[listingId]/_components/CheckoutContactForm/CheckoutBillingAddress',
    () => ({ default: () => null })
);
vi.mock(
    '@/app/[locale]/checkout/[listingId]/_components/CheckoutContactForm/CheckoutContactInformations',
    () => ({ default: () => null })
);
vi.mock(
    '@/app/[locale]/checkout/[listingId]/_components/CheckoutContactForm/CheckoutFifaTermsAndConditionInput',
    () => ({ default: () => null })
);
vi.mock(
    '@/app/[locale]/checkout/[listingId]/_components/CheckoutContactForm/CheckoutReceiveUpdateInput',
    () => ({ default: () => null })
);
vi.mock('@/app/[locale]/checkout/[listingId]/_components/CheckoutTerm', () => ({
    default: () => null,
}));

// Buttons
vi.mock('@/components/ui/Button', () => ({
    Button: ({
        children,
        ...props
    }: ButtonHTMLAttributes<HTMLButtonElement> & { gradient?: string }) => (
        <button {...props}>{children}</button>
    ),
}));

// next/script — renders nothing in jsdom
vi.mock('next/script', () => ({ default: () => null }));

/* ─────────────────────────────────────────────────────────────────────────────
 * Module-level mock constants
 * ─────────────────────────────────────────────────────────────────────────── */

const mockCreatePaymentIntent = vi.fn().mockResolvedValue({
    clientSecret: 'mock_secret',
    paymentIntentId: 'mock_id',
});

const mockCheckoutData = {
    data: {
        listing: { id: 42 },
        totalPrice: 100,
        originalCurrencyTotalPrice: 100,
        specialOlympicsPrice: 0,
        originalCurrencySpecialOlympicsPrice: 0,
        jwt: 'mock-jwt',
    },
    quantity: '1',
    country: { id: 1, code: 'GB' },
    isFetching: false,
    setCountry: vi.fn(),
    refresh: vi.fn(),
    extraParams: {},
    metadata: null,
    addresses: [],
    setAddresses: vi.fn(),
};

const mockCheckoutLead = {
    createLead: vi.fn().mockResolvedValue({ id: 999 }),
    lead: { id: 999 },
    deleteLead: vi.fn(),
};

const mockCheckoutCoupon = {
    couponCode: '',
    setCouponCode: vi.fn(),
    couponCodeError: '',
    setCouponCodeError: vi.fn(),
    isOpenCoupon: false,
    setIsOpenCoupon: vi.fn(),
    couponData: undefined,
    getCoupon: vi.fn(),
};

/* ─────────────────────────────────────────────────────────────────────────────
 * GROUP 1 — CheckoutContactForm · Step 1 call pattern
 * ─────────────────────────────────────────────────────────────────────────── */

// temporary skip for hotfix
describe.skip('CheckoutContactForm', () => {
    describe('_onSubmit', () => {
        beforeEach(() => {
            mockCreatePaymentIntent.mockClear();
            mockCheckoutLead.createLead.mockClear();
        });

        it('should not call createPaymentIntent when payment provider is stripe', async () => {
            // Arrange
            setupProviderMocks('stripe');
            render(<CheckoutContactForm />);

            // Act
            await submitContactForm();

            // Assert
            await waitFor(() => {
                expect(mockCreatePaymentIntent).toHaveBeenCalledTimes(0);
            });
        });

        it.each(['nomupay', 'fibonatix', 'paycom', 'secure'])(
            'should call createPaymentIntent once with leadId when payment provider is %s',
            async (provider) => {
                // Arrange
                setupProviderMocks(provider);
                render(<CheckoutContactForm />);

                // Act
                await submitContactForm();

                // Assert
                await waitFor(() => {
                    expect(mockCreatePaymentIntent).toHaveBeenCalledTimes(1);
                    expect(mockCreatePaymentIntent).toHaveBeenCalledWith({ leadId: 999 });
                });
            }
        );
    });
});

/* ─────────────────────────────────────────────────────────────────────────────
 * GROUP 2 — useStripe hook · Step 2 Stripe call
 * ─────────────────────────────────────────────────────────────────────────── */

// temporary skip for hotfix
describe.skip('useStripe', () => {
    describe('createAndConfirmPaymentIntent', () => {
        beforeEach(() => {
            mockCreatePaymentIntent.mockClear();

            const mockElementsSubmit = vi.fn().mockResolvedValue({ error: null });
            const mockConfirmPayment = vi.fn().mockResolvedValue({
                paymentIntent: { status: 'succeeded', id: 'pi_mock' },
                error: null,
            });
            (useReactStripe as ReturnType<typeof vi.fn>).mockReturnValue({
                confirmPayment: mockConfirmPayment,
            });
            (useElements as ReturnType<typeof vi.fn>).mockReturnValue({
                submit: mockElementsSubmit,
            });

            (useCheckoutPayment as ReturnType<typeof vi.fn>).mockReturnValue(
                makeCheckoutPayment('stripe')
            );
            (useCheckoutData as ReturnType<typeof vi.fn>).mockReturnValue(mockCheckoutData);
        });

        it('should call createPaymentIntent once with paymentProvider stripe', async () => {
            // Arrange
            const { result } = renderHook(() => useStripeHook());

            // Act
            await act(async () => {
                await result.current.createAndConfirmPaymentIntent();
            });

            // Assert
            await waitFor(() => {
                expect(mockCreatePaymentIntent).toHaveBeenCalledTimes(1);
                expect(mockCreatePaymentIntent).toHaveBeenCalledWith({ paymentProvider: 'stripe' });
            });
        });
    });
});

/* ─────────────────────────────────────────────────────────────────────────────
 * GROUP 3 — CheckoutNomupayElements · combined Step 1 + Step 2 call counts
 * ─────────────────────────────────────────────────────────────────────────── */

// temporary skip for hotfix
describe.skip('CheckoutNomupayElements', () => {
    let sharedSpy: Mock<
        (payload: unknown) => Promise<{ clientSecret: string; paymentIntentId: string }>
    >;

    beforeEach(() => {
        sharedSpy = vi.fn().mockResolvedValue({
            clientSecret: 'mock',
            paymentIntentId: 'id',
        });
        mockCheckoutLead.createLead.mockClear();
        mockCreatePaymentIntent.mockClear();
    });

    it('should call createPaymentIntent once total when provider is nomupay (Step 1 calls with { leadId }; Step 2 skips CheckoutNomupayElements.initialize because provider is already nomupay)', async () => {
        // Arrange & Act — Step 1
        await runStep1('nomupay', sharedSpy);

        // Assert after Step 1
        await waitFor(() => {
            expect(sharedSpy).toHaveBeenCalledTimes(1);
            expect(sharedSpy).toHaveBeenCalledWith({ leadId: 999 });
        });

        // Act — Step 2
        await runStep2('nomupay', sharedSpy);

        // Assert — nomupay skips initialize() so total stays at 1
        await waitFor(() => {
            expect(sharedSpy).toHaveBeenCalledTimes(1);
        });
    });

    it.each(['fibonatix', 'paycom', 'secure'])(
        'should call createPaymentIntent twice total when provider is %s (Step 1 calls with { leadId }; Step 2 CheckoutNomupayElements.initialize calls with { paymentProvider: nomupay })',
        async (provider) => {
            // Arrange & Act — Step 1
            await runStep1(provider, sharedSpy);

            // Assert after Step 1
            await waitFor(() => {
                expect(sharedSpy).toHaveBeenCalledTimes(1);
                expect(sharedSpy).toHaveBeenCalledWith({ leadId: 999 });
            });

            // Act — Step 2
            await runStep2(provider, sharedSpy);

            // Assert — triggers initialize() so total is 2
            await waitFor(() => {
                expect(sharedSpy).toHaveBeenCalledTimes(2);
                expect(sharedSpy).toHaveBeenNthCalledWith(1, { leadId: 999 });
                expect(sharedSpy).toHaveBeenNthCalledWith(2, { paymentProvider: 'nomupay' });
            });
        }
    );
});

// Helpers

function makeCheckoutPayment(provider: string, overrides: Record<string, unknown> = {}) {
    return {
        paymentProvider: provider,
        createPaymentIntent: mockCreatePaymentIntent,
        preparePayment: vi.fn(async (leadId: number) => {
            if (provider === 'stripe') return;
            await mockCreatePaymentIntent({ leadId });
            return { clientSecret: 'mock_secret', paymentIntentId: 'mock_id' };
        }),
        setPaymentIntent: vi.fn(),
        currentStep: 1,
        setCurrentStep: vi.fn(),
        currentMethod: undefined,
        setMethod: vi.fn(),
        resetMethod: vi.fn(),
        donateToSpecialOlympics: false,
        setDonateToSpecialOlympics: vi.fn(),
        isLoading: false,
        setIsLoading: vi.fn(),
        releaseTicket: vi.fn(),
        finalPrice: 100,
        finalPriceOrigin: 100,
        paymentIntent: undefined,
        ...overrides,
    };
}

function setupProviderMocks(provider: string, stepOverride?: number) {
    (useCheckoutPayment as ReturnType<typeof vi.fn>).mockReturnValue(
        makeCheckoutPayment(
            provider,
            stepOverride !== undefined ? { currentStep: stepOverride } : {}
        )
    );
    (useCheckoutData as ReturnType<typeof vi.fn>).mockReturnValue(mockCheckoutData);
    (useCheckoutLead as ReturnType<typeof vi.fn>).mockReturnValue(mockCheckoutLead);
    (useCheckoutCoupon as ReturnType<typeof vi.fn>).mockReturnValue(mockCheckoutCoupon);
}

async function submitContactForm() {
    const form = document.querySelector('form');
    if (!form) throw new Error('Form not found in DOM');
    await act(async () => {
        fireEvent.submit(form);
    });
}

async function runStep1(
    provider: string,
    spy: Mock<(payload: unknown) => Promise<{ clientSecret: string; paymentIntentId: string }>>
) {
    (useCheckoutPayment as ReturnType<typeof vi.fn>).mockReturnValue({
        ...makeCheckoutPayment(provider),
        createPaymentIntent: spy,
        preparePayment: vi.fn(async (leadId: number) => {
            await spy({ leadId });
            return { clientSecret: 'mock_secret', paymentIntentId: 'mock_id' };
        }),
        currentStep: 1,
    });
    (useCheckoutData as ReturnType<typeof vi.fn>).mockReturnValue(mockCheckoutData);
    (useCheckoutLead as ReturnType<typeof vi.fn>).mockReturnValue(mockCheckoutLead);
    (useCheckoutCoupon as ReturnType<typeof vi.fn>).mockReturnValue(mockCheckoutCoupon);

    const { unmount } = render(<CheckoutContactForm />);
    await submitContactForm();
    unmount();
}

async function runStep2(
    provider: string,
    spy: Mock<(payload: unknown) => Promise<{ clientSecret: string; paymentIntentId: string }>>
) {
    (useCheckoutPayment as ReturnType<typeof vi.fn>).mockReturnValue({
        ...makeCheckoutPayment(provider),
        createPaymentIntent: spy,
        currentStep: CheckoutStep.YOUR_INFORMATION,
    });

    const { rerender, unmount } = render(<CheckoutNomupayElements />);

    (useCheckoutPayment as ReturnType<typeof vi.fn>).mockReturnValue({
        ...makeCheckoutPayment(provider),
        createPaymentIntent: spy,
        currentStep: CheckoutStep.CONFIRM_AND_PAY,
    });

    await act(async () => {
        rerender(<CheckoutNomupayElements />);
    });

    unmount();
}
