import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [formValue, setFormValue] = useState({
    phoneNumber: "",
    accessCode: ""
  })

  const [status, setStatus] = useState("");

  const getResult = async () => {
    let result = await axios.post('http://localhost:3001/verify', {phoneNumber: formValue.phoneNumber, accessCode: formValue.accessCode})
                  .then(res => res)
                  .catch(err => console.log(err));
    console.log(result);
    setStatus(result.data);
  }

  const verifyPhoneNumber = async () => {
    let result = await axios.post('http://localhost:3001/getcode', {phoneNumber: formValue.phoneNumber})
                    .then(res => res)
                    .catch(err => {
                      console.error(err);
                    });
    console.log(result);
    setStatus(result.data);
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { phoneNumber, accessCode } = formValue;
  
    if (phoneNumber !== "" && accessCode === "") {
      verifyPhoneNumber();
    } else if (phoneNumber !== "" && accessCode !== "") {
      getResult();
    } else {
      setStatus("Can't verified")
    }
  }

  const handleChange = (e) => {
    const value = e.target.value;
    setFormValue({
      ...formValue,
      [e.target.name]: value
    });
  }

  return (
    <div className="App">
      <h4>Thang Nguyen's coding assignment</h4>
      <form onSubmit={handleSubmit}>
        <label for="phone-number">Phone number:</label>
        <br />
        <input type="text" name="phoneNumber" value={formValue.phoneNumber} onChange={handleChange} />
        <br />
        <label for="accesss-code">Access code:</label>
        <br />
        <input type="text" name="accessCode" value={formValue.accessCode} onChange={handleChange} />
        <br />
        <br />
        <input type="submit" value="Submit" />
      </form>
      {formValue.phoneNumber === "" && formValue.accessCode === "" 
        ? <></>
        : status
      }
    </div>
  );
}

export default App;
