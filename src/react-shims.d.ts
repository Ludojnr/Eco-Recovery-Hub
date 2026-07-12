declare module "react" {
  const React: any;
  export = React;
}

declare module "react/jsx-runtime" {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function jsxDEV(type: any, props: any, key?: any): any;
  export const Fragment: any;
}

declare module "@radix-ui/react-label" {
  export const Root: any;
}

declare module "@radix-ui/react-slot" {
  export const Slot: any;
}

declare module "react-hook-form" {
  export const Controller: any;
  export const FormProvider: any;
  export const useFormContext: any;
  export type ControllerProps<TFieldValues = any, TName = any> = any;
  export type FieldPath<TFieldValues = any> = any;
  export type FieldValues = any;
}
