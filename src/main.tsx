import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer, inject, Provider } from 'mobx-react';
import * as uuid from 'uuid';
import { MyStore, MyStoreType } from './store';
import { SayType } from './SayType';

interface HeaderProps {
    store?: MyStoreType
}

@inject('store')
@observer
class MyHeader extends React.Component<HeaderProps> {
    render() {
        const {store} = this.props;
        return <React.Fragment>
            <h1>id:{store!.id || 'no id'}</h1>
            <PcStatus />
        </React.Fragment>
    }
}

interface PcStatusProps {
    store?: MyStoreType
}

@inject('store')
@observer
class PcStatus extends React.Component<PcStatusProps> {
    render() {
        const {store} = this.props;
        return <ul>
            <li>pcA:{store!.pcAtgtId} [{store!.pcAState}] [{store!.dcAState}]</li>
            <li>pcB:{store!.pcBtgtId} [{store!.pcBState}] [{store!.dcBState}]</li>
            <li>pcC:{store!.pcCtgtId} [{store!.pcCState}] [{store!.dcCState}]</li>
        </ul>
    }
}

interface RegistrationProps {
    store?: MyStoreType
}

@inject('store')
@observer
class Registration extends React.Component<RegistrationProps> {
    private emailRef: React.RefObject<HTMLInputElement>;
    private passRef: React.RefObject<HTMLInputElement>;
    private nameRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<RegistrationProps>) {
        super(props);
        this.emailRef = React.createRef();
        this.passRef = React.createRef();
        this.nameRef = React.createRef();
    }
    registrationClickHandler(ev: React.MouseEvent) {
        const {store} = this.props;
        const email = this.emailRef.current!.value;
        const password = this.passRef.current!.value;
        const name = this.nameRef.current!.value;
        store!.registration(name, email, password).then((result) => {
            if (result) {
                alert('registration success!');
            } else {
                alert('registration fail!');
            }
        }).catch((err) => {
            console.error(err);
            alert('registration fail');
        });
    };
    render() {
        return <React.Fragment>
            <h3>registration</h3>
            <label>
                <span>email</span>
                <input type="email" ref={this.emailRef} />
            </label>
            <br/>
            <label>
                <span>password</span>
                <input type="password" ref={this.passRef} />
            </label>
            <br/>
            <label>
                <span>screen name</span>
                <input type="text" ref={this.nameRef} />
            </label>
            <br/>
            <button onClick={(ev) => {this.registrationClickHandler(ev)}}>
                registration
            </button>
        </React.Fragment>
    }
}

interface LogoutProps {
    store?: MyStoreType
}

@inject('store')
@observer
class Logout extends React.Component<LogoutProps> {
    logoutClickHandler() {
        this.props.store!.logout().catch((err) => console.error(err));
    }
    render() {
        return <button onClick={() => {this.logoutClickHandler()}}>logout</button>
    }
}

interface LoginProps {
    store?: MyStoreType
}

@inject('store')
@observer
class Login extends React.Component<LoginProps> {
    emailRef: React.RefObject<HTMLInputElement>;
    passRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<LoginProps>) {
        super(props);
        this.emailRef = React.createRef();
        this.passRef = React.createRef();
    }
    loginClickHandler(ev: React.MouseEvent) {
        const {store} = this.props;
        const email = this.emailRef.current!.value;
        const password = this.passRef.current!.value;
        store!.login(email, password).then((result) => {
            if (result) {
                store!.setLogged(true);
            } else {
                alert('login fail!');
            }
        }).catch((err) => {
            console.error(err);
            alert('login fail!');
        });
    }
    render() {
        return <React.Fragment>
            <h3>login</h3>
            <label>
                <span>email</span>
                <input type="email" ref={this.emailRef} />
            </label>
            <br/>
            <label>
                <span>password</span>
                <input type="password" ref={this.passRef} />
            </label>
            <br/>
            <button onClick={(ev) => {this.loginClickHandler(ev)}}>login</button>
        </React.Fragment>
    }
}

interface LoginContainerProps {
    store?: MyStoreType
}

@inject('store')
@observer
class LoginContainer extends React.Component<LoginContainerProps> {
    render() {
        const {store} = this.props;
        return <React.Fragment>
            {store!.logged ? <Logout /> : <React.Fragment>
                <Login />
                <Registration />
            </React.Fragment>}
        </React.Fragment>
    }
}

interface WriterProps {
    store?: MyStoreType
}

@inject('store')
@observer
class Writer extends React.Component<WriterProps> {
    private _inSayRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<WriterProps>) {
        super(props);
        this._inSayRef = React.createRef<HTMLInputElement>();
    }
    sendClickHandler(ev: React.MouseEvent) {
        console.log(this._inSayRef.current!.value);
        const {store} = this.props;
        const say: SayType = {
            id: uuid.v1(),
            date: Date.now(),
            author: store!.name,
            authorId: store!.serial,
            say: this._inSayRef.current!.value
        };
        store!.addSay(say).catch((err) => {
            console.error(err);
            alert('say send fail!!');
        });
    }
    render() {
        const {store} = this.props;
        return <div>
            <label>
                <span>{store!.name}'s say:</span>
                <input type="text" ref={this._inSayRef} disabled={store!.logged ? false:true} />
            </label>
            <span> </span>
            <button onClick={(ev) => {this.sendClickHandler(ev)}} disabled={store!.logged ? false:true}>send</button>
        </div>
    }
}

interface TimeLineProps {
    store?: MyStoreType
}

@inject('store')
@observer
class TimeLine extends React.Component<TimeLineProps> {
    render() {
        const {store} = this.props;
        const child = store!.timeLine.reverse().map(e => {
            return <li key={e.id}>
                <span>{e.author}</span>
                <span>:</span>
                <span>{e.say}</span>
            </li>
        });
        return <ul>{child}</ul>
    }
}

const App = () => (
    <Provider store={new MyStore()}>
        <React.Fragment>
            <MyHeader />
            <LoginContainer />
            <h3>main</h3>
            <Writer />
            <TimeLine />
        </React.Fragment>
    </Provider>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);