import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
    user: user ? user : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

//register
export const register = createAsyncThunk('auth/register', async (user, thunkApi) => {
    try {
        const res = await fetch('http://localhost:8080/auth/signup', {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = res.json();
        return data;
    } catch (error) {
        return thunkApi.rejectWithValue(error.message);
    }
});

//login
export const login = createAsyncThunk('auth/login', async (user, thunkApi) => {
    try {
        const res = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await res.json();
        if (data) {
            localStorage.setItem('user', JSON.stringify(data));
        }
        console.log(JSON.stringify(data));
        console.log(data);
        return data;
    } catch (error) {
        return thunkApi.rejectWithValue(error.message);
    }
});

//logout
export const logout = createAsyncThunk('auth/logout', async () => {
    await localStorage.removeItem('user');
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isError = false;
            state.isSuccess = false;
            state.isLoading = false;
            state.message = '';
        },
    },
    extraReducers: {
        //register
        [register.pending]: (state) => {
            state.isLoading = true;
        },
        [register.fulfilled]: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.user = action.payload;
        },
        [register.rejected]: (state, action) => {
            state.isLoading = false;
            state.user = null;
            state.isError = true;
            state.message = action.payload;
        },

        // login
        [login.pending]: (state) => {
            state.isLoading = true;
        },
        [login.fulfilled]: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.user = action.payload;
        },
        [login.rejected]: (state, action) => {
            state.isLoading = false;
            state.user = null;
            state.isError = true;
            state.message = action.payload;
        },

        // logout
        [logout.fulfilled]: (state, action) => {
            state.user = null;
        },
    },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;