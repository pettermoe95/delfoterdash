import { Chip } from '@brilliant/bds-core';
import { faker } from '@faker-js/faker';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { CellContent } from './cells/CellContent';
import type { DataTableProps } from './types';

type Person = {
    firstName: string;
    lastName: string;
    age: number;
    bio: string;
};

const buildPerson = (): Person => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 60 }),
    bio: faker.person.bio(),
});

faker.seed(42069);

const peopleData = Array(10).fill(0).map(buildPerson);

const columnHelper = createColumnHelper<Person>();

const peopleColumns = [
    columnHelper.accessor('firstName', {
        header: () => <span>First Name</span>,
    }),
    columnHelper.accessor((row) => row.lastName, {
        id: 'lastName',
        header: () => <span>Last Name</span>,
    }),
    columnHelper.accessor('age', {
        header: () => 'Age',
        cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('bio', {
        header: 'Bio',
    }),
];

export const peopleDataExample = {
    data: peopleData,
    columns: peopleColumns,
};

const buildCompany = (_value: number, idx: number) => ({
    id: idx + 1,
    name: faker.company.name(),
    catchPhrase: faker.company.catchPhrase(),
    owner: faker.person.fullName(),
    address: [
        faker.location.streetAddress(),
        faker.location.state(),
        faker.location.country(),
    ].join(', '),
    registered: faker.date.past({ years: 1 }),
    validTo: faker.date.future(),
});

type FakeCompany = ReturnType<typeof buildCompany>;

const companiesData = (rows: number) => Array(rows).fill(0).map(buildCompany);

const companyColumnHelper = createColumnHelper<FakeCompany>();
const companyColumns = [
    companyColumnHelper.accessor('id', {
        header: () => 'ID',
        cell: (info) => (
            <CellContent>
                <Chip
                    text={info.renderValue()?.toString() ?? '0'}
                    size="xs"
                    className="flex min-w-6 justify-center"
                />
            </CellContent>
        ),
        maxSize: 50,
    }),
    companyColumnHelper.accessor('name', {
        header: () => <span>Name</span>,
        maxSize: 300,
    }),
    companyColumnHelper.accessor('catchPhrase', {
        header: () => 'Catch Phrase',
        size: 300,
    }),
    companyColumnHelper.accessor('owner', {
        header: () => 'Owner',
    }),
    companyColumnHelper.accessor('address', {
        header: () => 'Address',
        size: 350,
    }),
    companyColumnHelper.accessor('registered', {
        header: () => 'Registered',
        cell: (info) => (
            <CellContent>
                {dayjs(info.getValue()).format('YYYY-MM-DD')}
            </CellContent>
        ),
    }),
    companyColumnHelper.accessor('validTo', {
        header: () => 'Valid To',
        cell: (info) => (
            <CellContent>
                {dayjs(info.getValue()).format('YYYY-MM-DD')}
            </CellContent>
        ),
    }),
];

type ExampleData<T> = Pick<
    DataTableProps<T>,
    'data' | 'columns' | 'defaultSorting'
>;

export const buildCompaniesTable = (rows: number) =>
    ({
        data: companiesData(rows),
        columns: companyColumns,
        defaultSorting: { id: 'id', desc: false },
    }) satisfies ExampleData<FakeCompany>;
