import React, { FunctionComponent, useMemo } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const CCAvenueMarsPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    ...rest
}) => {
    const description = useMemo(
        () => <TranslatedString id="payment.ccavenuemars_description_text" />,
        [],
    );

    return (
        <HostedPaymentComponent
            {...rest}
            checkoutService={checkoutService}
            deinitializePayment={checkoutService.deinitializePayment}
            description={description}
            initializePayment={checkoutService.initializePayment}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    CCAvenueMarsPaymentMethod,
    [{ id: 'ccavenue' }],
);
