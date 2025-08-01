import * as React from 'react';
import { ReactNode } from 'react';
import {
    useInfiniteListController,
    InfiniteListControllerProps,
    InfiniteListControllerResult,
} from './useInfiniteListController';
import { OptionalResourceContextProvider } from '../../core';
import { RaRecord } from '../../types';
import { ListContextProvider } from './ListContextProvider';
import { InfinitePaginationContext } from './InfinitePaginationContext';
import { useIsAuthPending } from '../../auth';

/**
 * Call useInfiniteListController and put the value in a ListContext
 *
 * Base class for <InfiniteList> components, without UI.
 *
 * Accepts any props accepted by useInfiniteListController:
 * - filter: permanent filter applied to the list
 * - filters: Filter element, to display the filters
 * - filterDefaultValues: object;
 * - perPage: Number of results per page
 * - sort: Default sort
 * - exporter: exported function
 *
 * @example // Custom list layout
 *
 * const PostList = () => (
 *     <InfiniteListBase perPage={10}>
 *         <div>
 *              List metrics...
 *         </div>
 *         <Grid container>
 *             <Grid item xs={8}>
 *                 <SimpleList primaryText={record => record.title} />
 *             </Grid>
 *             <Grid item xs={4}>
 *                 List instructions...
 *             </Grid>
 *         </Grid>
 *         <div>
 *             Post related links...
 *         </div>
 *     </ListBase>
 * );
 */
export const InfiniteListBase = <RecordType extends RaRecord = any>({
    children,
    render,
    loading = null,
    ...props
}: InfiniteListBaseProps<RecordType>) => {
    const controllerProps = useInfiniteListController<RecordType>(props);
    const isAuthPending = useIsAuthPending({
        resource: controllerProps.resource,
        action: 'list',
    });

    if (isAuthPending && !props.disableAuthentication) {
        return loading;
    }

    if (!render && !children) {
        throw new Error(
            "<InfiniteListBase> requires either a 'render' prop or 'children' prop"
        );
    }

    return (
        // We pass props.resource here as we don't need to create a new ResourceContext if the props is not provided
        <OptionalResourceContextProvider value={props.resource}>
            <ListContextProvider value={controllerProps}>
                <InfinitePaginationContext.Provider
                    value={{
                        hasNextPage: controllerProps.hasNextPage,
                        fetchNextPage: controllerProps.fetchNextPage,
                        isFetchingNextPage: controllerProps.isFetchingNextPage,
                        hasPreviousPage: controllerProps.hasPreviousPage,
                        fetchPreviousPage: controllerProps.fetchPreviousPage,
                        isFetchingPreviousPage:
                            controllerProps.isFetchingPreviousPage,
                    }}
                >
                    {render ? render(controllerProps) : children}
                </InfinitePaginationContext.Provider>
            </ListContextProvider>
        </OptionalResourceContextProvider>
    );
};

export interface InfiniteListBaseProps<RecordType extends RaRecord = any>
    extends InfiniteListControllerProps<RecordType> {
    loading?: ReactNode;
    children?: ReactNode;
    render?: (props: InfiniteListControllerResult<RecordType>) => ReactNode;
}
