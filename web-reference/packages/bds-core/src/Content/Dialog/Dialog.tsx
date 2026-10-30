'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';
import { cn, Icon } from '../..';
import { useOverlayContainer } from '../../Utility/OverlayContainerProvider';

export type DialogProps = {
    children?: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?(open: boolean): void;
    modal?: boolean;
};

type DialogTitleProps = React.ComponentPropsWithoutRef<
    typeof DialogPrimitive.Title
> & {
    titleIconName?: string;
    titleIconColor?: 'red' | 'black' | 'blue';
};

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

function DialogPortal({
    container,
    ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>) {
    const defaultContainer = useOverlayContainer();

    return (
        <DialogPrimitive.Portal
            container={container ?? defaultContainer}
            {...props}
        />
    );
}

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'pointer-events-none fixed inset-0 z-40 bg-black/80',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogContentProps = React.ComponentPropsWithoutRef<
    typeof DialogPrimitive.Content
> & {
    showCloseButton?: boolean;
};

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    DialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                'fixed left-[33%] top-[50%] z-50 xl:left-[48%]',
                'grid w-[calc(100vw-32px)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-3xl md:min-w-[400px] lg:min-w-[660px] xl:min-w-[696px]',
                'border border-secondary bg-primary px-4xl py-3xl shadow-lg duration-200',
                'max-h-[90vh] overflow-y-auto',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                'data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
                'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
                className
            )}
            {...props}
        >
            {children}
            {showCloseButton && (
                <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 mr-[10px] cursor-pointer rounded-sm text-fg-quaternary transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none">
                    <Icon icon="bv:close" width={28} height={28} />
                    <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
            )}
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            'flex flex-col space-y-1.5 text-center sm:text-left',
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('space-x-[12px] pt-[32px]', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    DialogTitleProps
>(({ className, titleIconColor, titleIconName, ...props }, ref) => (
    <div className="flex items-center gap-2">
        {titleIconName && titleIconColor && (
            <Icon
                icon={titleIconName}
                width={24}
                height={24}
                color={titleIconColor}
            />
        )}
        <DialogPrimitive.Title
            ref={ref}
            className={cn(
                'text-secondary bv-display-font-xs-regular',
                className
            )}
            {...props}
        />
    </div>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn('text-primary bv-text-font-lg-regular', className)}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
