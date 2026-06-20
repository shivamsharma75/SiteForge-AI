import axios from 'axios'
import { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
    const dispatch = useDispatch()
    const [authLoading, setAuthLoading] = useState(true)

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/me`, { withCredentials: true })
                dispatch(setUserData(result.data))
            } catch (error) {
                console.log(error)
            } finally {
                setAuthLoading(false)
            }
        }
        getCurrentUser()
    }, [])

    return { authLoading }
}

export default useGetCurrentUser
