import React, { useEffect, useState } from 'react'
import './App.css'
import { AccountType } from './types/Account'
import {api} from "./api/api";

export const App = () => {
  const [user, setUser] = useState<AccountType>()
  const [loading, setLoading] = useState(true)

  const logIn = async () => {
    setLoading(true)
    try {
      const data = await api.logIn("admin@gmail.com", "password")
      console.log(data.data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    logIn()
  }, [])

  return (
      <div className="App">
        {loading && <p>Loading...</p>}
      </div>
  )
}