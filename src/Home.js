import React from 'react';
import { 
  useTable,
  useSortBy,
  usePagination,
  useRowSelect,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
} from 'react-table'
import moment from 'moment';
import { Button } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import 'react-datepicker/dist/react-datepicker.css';
import './Home.css'

function Home() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false)

  const [dbData, setDbData] = React.useState([])

  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    refreshData()
  }, []);

  function refreshData() {
    setLoading(true)
    axios.get(`https://protective-tidy-vessel.glitch.me/invoices`)
    .then((res) => {
      console.log('wait')
      setDbData(res.data)
      setLoaded(true)
    })
    .catch(err => console.log('Error: ', err))
    .finally(() => {
      setLoading(false)
    })
  }

  function renderTable() {
    return(
      <Table tableData={dbData} refreshData={refreshData} />
    )
  }

  return (
    <div className="mt-5 pt-3">
      {
        loaded && <div className="home-add-button-container">
          <Button variant="primary" className="home-add-button align" onClick={() => navigate('/new-invoice')}>
            Add Invoice
          </Button>
        </div>
      }
      {
        loaded && renderTable()
      }
    </div>
  )
}

function Table({tableData, refreshData}) {
  const navigate = useNavigate();

  const data = React.useMemo(
    () => ([...tableData]),
    // getData(),
    [tableData]
  )

  const columns = React.useMemo(
    () => [
      {
        Header: 'No',
        accessor: (row, rowIndex) => {
          console.log('rowwwww', row)
          return (rowIndex + 1)
        },
        disableFilters: true,
        collapsed: true,
      },
      {
        Header: 'From',
        accessor: 'from',
      },
      {
        Header: 'To',
        accessor: 'to',
      },
      {
        Header: 'Invoice Date',
        accessor: (row, rowIndex) => moment(row.invoiceDate).format('DD/MM/YY'),
        Filter: DateFilter,
        filter: 'date',
      },
      {
        Header: 'Due Date',
        accessor: (row, rowIndex) => moment(row.dueDate).format('DD/MM/YY'),
        Filter: DateFilter,
        filter: 'date',
      },
      {
        Header: 'Action',
        disableFilters: true,
        disableSortBy: true,
        accessor: (row, rowIndex) => {
          console.log('row', row)
          return (
            <div>
              <Button variant="primary" onClick={() => {
                navigate('/invoice', { state: { id: row.id } });
              }}>View</Button>
              {' '}
              <Button variant="danger" onClick={() => {
                axios.delete(`https://protective-tidy-vessel.glitch.me/invoice/${row.id}`)
                .then((res) => {
                  alert(`Delete row ${row.id} success`)
                  refreshData()
                })
                .catch(err => console.log('Error: ', err))
              }}>Delete</Button>
            </div>
          )
      },
      },
    ],
    []
  )

  const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef()
      const resolvedRef = ref || defaultRef
  
      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
      }, [resolvedRef, indeterminate])
  
      return (
        <>
          <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
      )
    }
  )
  
  function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
  }) {
    const count = preFilteredRows.length

    return (
      <input
        value={filterValue || ''}
        onChange={e => {
          setFilter(e.target.value || undefined)
        }}
        placeholder={`Search ${count} records...`}
      />
    )
  }

  function DateFilter({
    column: { filterValue = [], preFilteredRows, setFilter, id },
  }) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <DatePicker style={{
          width: '70px',
          marginRight: '0.5rem',
        }} selected={filterValue[0] || ''} onChange={(date) => {
            setFilter((old = []) => [moment(date, 'DD/MM/YYYY').isValid() ? date : undefined, old[1]])
          }} />
        {'\xa0to\xa0'}
        <DatePicker style={{
          width: '70px',
          marginRight: '0.5rem',
        }} selected={filterValue[1] || ''} onChange={(date) => {
            setFilter((old = []) => [old[0], moment(date, 'DD/MM/YYYY').isValid() ? date : undefined])
          }} />
      </div>
    )
  }

  const filterTypes = React.useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
      date: dateFilterFn,
    }),
    []
  )

  function dateFilterFn(rows, id, filterValue) {
    let d1 = moment(filterValue[0], 'DD/MM/YYYY')
    let d2 = moment(filterValue[1], 'DD/MM/YYYY')

    return rows.filter(row => {
      const rowValue = moment(row.values[id], 'YYYY-MM-DD')
      return rowValue !== undefined
        ? (d1.isSameOrBefore(rowValue) && d2.isSameOrAfter(rowValue))
        : false
    })
  }

  dateFilterFn.autoRemove = filterValue => (!filterValue[0] && !filterValue[1])
  
  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable({
        columns,
        data,
        defaultColumn,
        filterTypes,
      },
      useFilters,
      useGlobalFilter,
      useSortBy,
      usePagination,
      useRowSelect,
      hooks => {
        hooks.visibleColumns.push(columns => [
          {
            id: 'selection',
            Header: ({ getToggleAllPageRowsSelectedProps }) => (
              <div>
                <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()}/>
              </div>
            ),
            Cell: ({ row }) => (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()}/>
              </div>
            ),
            collapsed: true,
          },
          ...columns,
        ])
      })

  return (
    <div className="home-table-container">
      <div className="home-table-wrapper">
        <div className="pagination">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>{' '}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>{' '}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {'>'}
          </button>{' '}
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            {'>>'}
          </button>{' '}
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
          <span>
            | Go to page:{' '}
            <input
              type="number"
              min={0}
              max={pageCount - 1}
              disabled={pageCount <= 0}
              defaultValue={pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                gotoPage(page)
              }}
              style={{ width: '100px' }}
            />
          </span>{' '}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <table {...getTableProps()}
          // style={{ border: 'solid 1px black' }}
        >
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    // {...column.getHeaderProps(column.getSortByToggleProps())}
                    {
                      ...column.getHeaderProps({
                        className: column.collapsed ? 'collapsed' : '',
                      })
                    }
                    style={{
                      border: 'solid 1px black',
                      // background: 'aliceblue',
                      color: 'black',
                      fontWeight: 'bold',
                    }}
                  >
                    <div {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      {
                        column.canSort && <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      }
                    </div>
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, index) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <td
                        {...cell.getCellProps({
                          className: cell.column.collapsed ? 'collapsed' : '',
                        })}
                        style={{
                          padding: '5px',
                          border: 'solid 1px black',
                          // background: 'papayawhip',
                        }}
                      >
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Home