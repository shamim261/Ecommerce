import React, { useContext, useEffect, useReducer } from 'react'
import Table from 'react-bootstrap/Table';
import { Button } from '@mui/material';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import { useNavigate } from 'react-router-dom';

const reducer =(state,action) =>{
    switch(action.type) {
      case 'FETCH_REQUEST':
        return {...state,loading:true }
      case 'FETCH_SUCCESS':
        return {...state, product:action.payload, loading:false}
      case 'FETCH_FAIL':
        return {...state, error:action.payload, loading:false}
      default:
        return state;
    }
  
  }
  
function ProductListComponent() {
  const navigate = useNavigate()
  const {state} = useContext(Store);
  const {userInfo} = state;
  const Id = localStorage.getItem('userInfo._id');
  
  const [{error, product, loading}, dispatch] = useReducer(reducer, {
    error:'',
    loading:true,
    product:[],
  })

  useEffect(() => {
    const fatchData = async() =>{
      dispatch({type:'FETCH_REQUEST'});
      try{
        const {data} = await axios.get(
          `/api/allproduct/${Id}`,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        dispatch({type: 'FETCH_SUCCESS', payload:data})
      } catch(error) {
        dispatch({type: 'FETCH_FAIL', payload:getError(error)})
      }
    }
    fatchData();
  },[userInfo,Id])
  return (
    <div className='ProductListComponent'>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Id</th>
              <th>name</th>
              <th>category</th>
              <th>Stock</th>
              <th>price</th>
              <th>rating</th>
              <th>NOR</th>
              <th>Edit Product</th>
            </tr>
          </thead>
          <tbody>
            {
              product.map((pro) => (
              <tr key={pro._id} >
                <td>{pro._id}</td>
                <td>{pro.name}</td>
                <td>{pro.category}</td>
                <td>{pro.countInStock}</td>
                <td>{pro.price}</td>
                <td>{pro.rating}</td>
                <th>{pro.numReviews}</th>
                <th><Button 
                  variant="contained" 
                  color="success"
                  onClick={() => {
                    navigate(`/productdetails/${pro._id}`);
                  }}
                >Product Details</Button></th>
              </tr> 
              ))
            }
            
          </tbody>
        </Table>
    </div>
  )
}

export default ProductListComponent