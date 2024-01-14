import { useAccount } from '../../../hooks/useAccount'
import { Avatar, Button, TextField, FormHelperText, Typography } from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormContainer } from './styles'

const schema = yup.object({
    login: yup.string().required('Login is required').min(2, 'Must be at least 2 characters'),
    password: yup.string().required('Password is required'),
})

type LoginFormType = yup.InferType<typeof schema>

export const LoginPageComponent = () => {
    const {logIn} = useAccount()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormType>({
        resolver: yupResolver(schema),
    })

    const onSubmit = handleSubmit(({ login, password }) => {
        logIn(login, password)
    })

    return (
        <FormContainer>
            <Avatar>
                <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
                Sign in
            </Typography>
            <form onSubmit={onSubmit}>
                <TextField
                    {...register('login')}
                    margin="normal"
                    fullWidth
                    id="login"
                    label="Login"
                    name="login"
                    autoComplete="login"
                    autoFocus
                />
                <FormHelperText id="login" error>
                    {errors?.login?.message}
                </FormHelperText>
                <TextField
                    {...register('password')}
                    margin="normal"
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                />
                <FormHelperText id="password" error>
                    {errors?.password?.message}
                </FormHelperText>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    Sign In
                </Button>
            </form>
        </FormContainer>
    )
}