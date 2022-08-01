import './Login.scss';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PrimaryButton from '../../common/PrimaryButton/Button';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object({
    email: Yup.string().required('this field is required').email('email format is invalid'),
    password: Yup.string().required('this field is required'),
});

const intialValues = {
    email: '',
    password: '',
};

const onSubmit = (values) => {
    console.log('values are :', values);
};

export default function Login() {
    const navigate = useNavigate();
    return (
        <section className="login my-5">
            <div className="container bg-white rounded-2">
                <div className="row h-100">
                    <div className="col-6 d-none d-lg-block p-0">
                        <div className="login-left px-5 h-100 d-flex flex-column justify-content-center text-center">
                            <h1 className="text-white fw-bold fs-1">Amzon Website</h1>
                            <p className="text-white lead">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui ea ullam eos, quasi dolorum
                                odio{' '}
                            </p>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6 p-0">
                        <Formik initialValues={intialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                            {(props) => (
                                <Form className="p-5">
                                    <h1
                                        onClick={() => {
                                            console.log(props);
                                        }}
                                        className="text-center"
                                    >
                                        Sign In
                                    </h1>
                                    <p className="lead text-center">sign in your account</p>
                                    <div className="form-group">
                                        <label className="my-2" htmlFor="exampleInputEmail1">
                                            Email address
                                        </label>
                                        <Field
                                            name="email"
                                            className="form-control"
                                            id="exampleInputEmail1"
                                            aria-describedby="emailHelp"
                                            placeholder="Enter email"
                                        />
                                        <p className="error-msg text-danger">
                                            <ErrorMessage className="text-danger" name="email" />
                                        </p>
                                    </div>
                                    <div className="form-group">
                                        <label className="my-2" htmlFor="exampleInputEmail1">
                                            Password
                                        </label>
                                        <Field
                                            name="password"
                                            type="password"
                                            className="form-control"
                                            id="exampleInputPassword1"
                                            placeholder="Enter password"
                                        />
                                        <p className="error-msg text-danger">
                                            <ErrorMessage className="text-danger" name="password" />
                                        </p>
                                    </div>
                                    <div className="form-group mt-4">
                                        <input
                                            type="submit"
                                            className="rounded-2 me-3"
                                            value="login"
                                            disabled={(props.dirty && !props.isValid) || !props.dirty}
                                        />
                                        <input
                                            type="button"
                                            className="rounded-2 sigin-up"
                                            value="sigin up"
                                            onClick={() => {
                                                navigate('/signUp');
                                            }}
                                        />
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </section>
    );
}