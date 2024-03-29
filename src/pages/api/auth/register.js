import axios from 'axios'
import { withIronSessionApiRoute } from 'iron-session/next'

import { sessionOptions } from '~lib'

const registerRoute = async (req, res) => {
  const { username, email, password } = req.body

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`, {
      username,
      email,
      password,
    })

    const token = response.data.jwt

    if (token) {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me?populate=*`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      })

      const auth = { user: response.data, token, isLoggedIn: true }

      req.session = auth
      await req.session.save()
      res.json(auth)
    }
  } catch (error) {
    if (!error.response?.data?.error.message) {
      return res.status(500).json({ message: 'Internal server error' })
    } else {
      res.json(error.response?.data)
    }
  }
}

const handler = withIronSessionApiRoute(registerRoute, sessionOptions)

export default handler
