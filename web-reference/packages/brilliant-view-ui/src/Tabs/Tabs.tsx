'use client';

import type { BVIconName } from '@brilliant/bds-core';
import { cn, Icon } from '@brilliant/bds-core';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <div className="border-b-2 border-primary">
        <TabsPrimitive.List
            ref={ref}
            className={cn(
                '-mb-[2px] inline-flex items-center gap-xs text-secondary',
                className
            )}
            {...props}
        />
    </div>
));
TabsList.displayName = TabsPrimitive.List.displayName;

type TabsTriggerProps = {
    icon?: `bv:${BVIconName}`;
} & React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    TabsTriggerProps
>(({ className, children, icon, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            'inline-flex items-center justify-center gap-xs whitespace-nowrap',
            'cursor-pointer border-x-0 border-b-2 border-t-0 border-solid border-transparent px-lg py-sm',
            'text-secondary transition-all bv-text-font-sm-medium',
            'hover:text-primary',
            'focus-visible:ring-brand focus-visible:ring-2',
            'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            'data-[state=active]:border-brand-primary-solid data-[state=active]:text-primary',
            className
        )}
        {...props}
    >
        {icon && <Icon icon={icon} className="text-xl" />}
        {children}
    </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            className
        )}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
