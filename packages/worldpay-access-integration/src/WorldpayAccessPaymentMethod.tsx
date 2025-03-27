import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, {
    createRef,
    FunctionComponent,
    RefObject,
    useCallback,
    useRef,
    useState,
} from 'react';

import {
    CreditCardPaymentMethodComponent,
    CreditCardPaymentMethodProps,
} from '@bigcommerce/checkout/credit-card-integration';
import { useHostedCreditCard } from '@bigcommerce/checkout/hosted-credit-card-integration';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { Modal } from '@bigcommerce/checkout/ui';

export type WorldpayCreditCardPaymentMethodProps = CreditCardPaymentMethodProps;

interface WorldpayPaymentMethodRef {
    paymentPageContentRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const WorldpayCreditCardPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    language,
    method,
    onUnhandledError,
    paymentForm,
    ...rest
}) => {
    const [threeDSecureVerification, setThreeDSecureVerification] = useState<HTMLElement>();

    const ref = useRef<WorldpayPaymentMethodRef>({
        paymentPageContentRef: createRef(),
    });

    const cancelWorldpayModalFlow = useCallback(() => {
        setThreeDSecureVerification(undefined);

        if (ref.current.cancelThreeDSecureVerification) {
            ref.current.cancelThreeDSecureVerification();
            ref.current.cancelThreeDSecureVerification = undefined;
        }
    }, []);

    const { getHostedFormOptions, getHostedStoredCardValidationFieldset } = useHostedCreditCard({
        checkoutState,
        method,
        language,
        paymentForm,
    });

    const initializeWorldpayPayment = useCallback(
        async (options: PaymentInitializeOptions, selectedInstrument) => {
            return checkoutService.initializePayment({
                ...options,
                creditCard: {
                    form: getHostedFormOptions &&
                        (await getHostedFormOptions(selectedInstrument)),
                },
                worldpay: {
                    onLoad(content: HTMLIFrameElement, cancel: () => void) {
                        setThreeDSecureVerification(content);
                        ref.current.cancelThreeDSecureVerification = cancel;
                    },
                },
            });
        },
        [checkoutService, getHostedFormOptions],
    );

    const appendPaymentPageContent = useCallback(() => {
        if (threeDSecureVerification) {
            ref.current.paymentPageContentRef.current?.appendChild(threeDSecureVerification);
        }
    }, [threeDSecureVerification]);

    return (
        <>
            <CreditCardPaymentMethodComponent
                {...rest}
                checkoutService={checkoutService}
                checkoutState={checkoutState}
                deinitializePayment={checkoutService.deinitializePayment}
                initializePayment={initializeWorldpayPayment}
                language={language}
                method={method}
                onUnhandledError={onUnhandledError}
                paymentForm={paymentForm}
                getStoredCardValidationFieldset={getHostedStoredCardValidationFieldset}
            />
            <Modal
                isOpen={!!threeDSecureVerification}
                onAfterOpen={appendPaymentPageContent}
                onRequestClose={cancelWorldpayModalFlow}
                shouldShowCloseButton={true}
            >
                <div ref={ref.current.paymentPageContentRef} />
            </Modal>
        </>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    WorldpayCreditCardPaymentMethod,
    [{ id: 'worldpayaccess' }],
);
