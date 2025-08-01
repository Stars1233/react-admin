import React from 'react';
import { useList, UseListOptions } from './useList';
import { ListContextProvider } from './ListContextProvider';
import { ListIterator } from './ListIterator';
import { useRecordContext } from '../record';

export default {
    title: 'ra-core/controller/list/ListIterator',
};

const data = [
    { id: 1, title: 'War and Peace' },
    { id: 2, title: 'The Little Prince' },
    { id: 3, title: "Swann's Way" },
    { id: 4, title: 'A Tale of Two Cities' },
    { id: 5, title: 'The Lord of the Rings' },
    { id: 6, title: 'And Then There Were None' },
    { id: 7, title: 'Dream of the Red Chamber' },
    { id: 8, title: 'The Hobbit' },
    { id: 9, title: 'She: A History of Adventure' },
    { id: 10, title: 'The Lion, the Witch and the Wardrobe' },
];

export const UsingRender = ({
    empty,
    ...props
}: UseListOptions & { empty?: boolean }) => {
    const value = useList({
        data: empty ? [] : data,
        sort: { field: 'id', order: 'ASC' },
        ...props,
    });

    return (
        <ListContextProvider value={value}>
            <ul
                style={{
                    listStyleType: 'none',
                }}
            >
                <ListIterator
                    loading={<div>Loading...</div>}
                    empty={<div>No data</div>}
                    render={record => (
                        <li
                            style={{
                                padding: '10px',
                                border: '1px solid #ccc',
                            }}
                        >
                            {record.title}
                        </li>
                    )}
                />
            </ul>
        </ListContextProvider>
    );
};

UsingRender.args = {
    isPending: false,
    empty: false,
};

UsingRender.argTypes = {
    isPending: { control: 'boolean' },
    empty: { control: 'boolean' },
};

const ListItem = () => {
    const record = useRecordContext();
    return (
        <li
            style={{
                padding: '10px',
                border: '1px solid #ccc',
            }}
        >
            {record?.title}
        </li>
    );
};

export const UsingChildren = ({
    empty,
    ...props
}: UseListOptions & { empty?: boolean }) => {
    const value = useList({
        data: empty ? [] : data,
        sort: { field: 'id', order: 'ASC' },
        ...props,
    });

    return (
        <ListContextProvider value={value}>
            <ul
                style={{
                    listStyleType: 'none',
                }}
            >
                <ListIterator
                    loading={<div>Loading...</div>}
                    empty={<div>No data</div>}
                >
                    <ListItem />
                </ListIterator>
            </ul>
        </ListContextProvider>
    );
};

UsingChildren.args = {
    isPending: false,
    empty: false,
};

UsingChildren.argTypes = {
    isPending: { control: 'boolean' },
    empty: { control: 'boolean' },
};
