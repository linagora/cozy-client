export default withMutation;
declare function withMutation(mutation: any, options?: {}): (WrappedComponent: any) => {
    (props: any): JSX.Element;
    displayName: string;
};
