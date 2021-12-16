import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';
import './NewInvoice.css'

function NewInvoice() {
  const navigate = useNavigate();
  // console.log(state, id)
  const [data, setData] = React.useState(null)
  const [from, setFrom] = React.useState('')
  const [to, setTo] = React.useState('')
  const [invoiceDate, setInvoiceDate] = React.useState(null)
  const [dueDate, setDueDate] = React.useState(null)

  const [details, setDetails] = React.useState([])

  const [loading, setLoading] = React.useState(false)

  function detailChange(value, index, category) {
    let temp = [...details]
    temp[index][category] = value
    setDetails(temp)
  }

  function pushDetails(value) {
    let temp = [...details]
    temp.push(value)
    setDetails(temp)
  }

  function isDetailValid() {
    if (details.length <= 0) return false
    let temp = true
    details.forEach(item => {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        temp = false
      }
    })
    return temp
  }

  function validate() {
    let fromValid = from
    let toValid = to
    let invoiceDateValid = moment(invoiceDate).isValid()
    let dueDateValid = moment(dueDate).isValid()
    let detailsValid = isDetailValid()

    if (fromValid && toValid && invoiceDateValid && dueDateValid && detailsValid) {
      setLoading(true)
      axios.post(`https://protective-tidy-vessel.glitch.me/invoice`, {
        from,
        to,
        invoiceDate,
        dueDate,
        details: JSON.stringify(details),
      }).then((res) => {
        alert('Create Invoice Success')
        navigate('/invoice/', {state: {id: res.data[0].id}})
      }).catch(err => console.log('Error: ', err))
      .finally(() => setLoading(false))
    } else {
      let temp = ''
      if (!fromValid) temp = temp.concat('Invoice From invalid\n')
      if (!toValid) temp = temp.concat('Invoice To invalid\n')
      if (!invoiceDateValid) temp = temp.concat('Invoice Date invalid\n')
      if (!dueDateValid) temp = temp.concat('Due Date invalid\n')
      if (!detailsValid) temp = temp.concat('Invoice Details invalid\n')
      alert(temp)
    }
  }

  return (
    <div className="mt-5 pt-3">
      <div className="invoice-form-wrapper">
        {/* {details && JSON.stringify(details)} */}
        <Form>
          {/* <Row className="mb-3">
            <Form.Group as={Col} className="mb-3" controlId="formBasicEmail">
              <Form.Label>Invoice Number</Form.Label>
              <Form.Control readOnly type="text" placeholder="Enter company name" value={id}/>
            </Form.Group>
          </Row> */}

          <Row className="mb-3">
            <Form.Group as={Col} className="mb-3" controlId="formBasicFrom">
              <Form.Label>Invoice From</Form.Label>
              <Form.Control type="text" placeholder="Enter company name" value={from} onInput={(e) => setFrom(e.target.value)} readOnly={loading}/>
            </Form.Group>

            <Form.Group as={Col} className="mb-3" controlId="formBasicTo">
              <Form.Label>Invoice To</Form.Label>
              <Form.Control type="text" placeholder="Enter company name" value={to} onInput={(e) => setTo(e.target.value)} readOnly={loading}/>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} className="mb-3" controlId="formBasicInvoiceDate">
              <Form.Label>Invoice Date</Form.Label><br/>
              <div className="invoice-date-picker-container">
                <DatePicker disabled={loading} selected={invoiceDate} onChange={(date) => setInvoiceDate(date)}/>
              </div>
            </Form.Group>

            <Form.Group as={Col} className="mb-3" controlId="formBasicDueDate">
              <Form.Label>Due Date</Form.Label><br/>
              <div className="invoice-date-picker-container">
                <DatePicker disabled={loading} selected={dueDate} onChange={(date) => setDueDate(date)}/>
              </div>
            </Form.Group>
          </Row>

          <Button variant="primary" onClick={() => pushDetails({id: '', name: '', price: '', quantity: ''}) }>
            + Add Item
          </Button>

          <Row className="mt-5">
            <Form.Group className="mb-3" controlId="formBasicItem">
            {
              details.map((item, index) => {
                return (
                  <div className="mb-5" key={`item-map-${index}`}>
                    <Form.Label>Item {index + 1} ID</Form.Label>
                    <Form.Control type="text" placeholder="Enter item ID" value={item.id} onInput={(e) => detailChange(e.target.value, index, 'id')} readOnly={loading}/>
                    <Form.Label>Item {index + 1} Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter item name" value={item.name} onInput={(e) => detailChange(e.target.value, index, 'name')} readOnly={loading}/>
                    <Form.Label>Item {index + 1} Price</Form.Label>
                    <Form.Control type="text" placeholder="Enter item price" value={item.price} onInput={(e) => detailChange(e.target.value, index, 'price')} readOnly={loading}/>
                    <Form.Label>Item {index + 1} Quantity</Form.Label>
                    <Form.Control type="text" placeholder="Enter item quantity" value={item.quantity} onInput={(e) => detailChange(e.target.value, index, 'quantity')} readOnly={loading}/>
                    <br/>
                    <Button variant="danger" onClick={() => setDetails([...details.slice(0, index), ...details.slice(index + 1)])}>
                      Delete Item
                    </Button>
                  </div>
                  )
                })
              }
                </Form.Group>
          </Row>
          <Button variant="primary" onClick={() => {
             validate()
            }
          }>
            Submit
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default NewInvoice