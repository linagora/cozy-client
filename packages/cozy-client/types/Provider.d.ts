export default CozyProvider;
declare function CozyProvider({ store, client, children }: {
    store: any;
    client: any;
    children: any;
}): JSX.Element;
declare namespace CozyProvider {
    namespace propTypes {
        export { storePropType as store };
        export const client: PropTypes.Validator<object>;
        export const children: PropTypes.Validator<PropTypes.ReactElementLike | PropTypes.ReactElementLike[]>;
    }
}
declare const storePropType: PropTypes.Requireable<PropTypes.InferProps<{
    subscribe: PropTypes.Validator<(...args: any[]) => any>;
    dispatch: PropTypes.Validator<(...args: any[]) => any>;
    getState: PropTypes.Validator<(...args: any[]) => any>;
}>>;
import PropTypes from "prop-types";
