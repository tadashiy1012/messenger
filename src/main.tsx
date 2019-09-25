/** @jsx jsx */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer, inject, Provider } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import * as uuid from 'uuid';
import { MyStore, MyStoreType } from './store';
import { SayType } from './types';
import 'purecss/build/pure.css';

interface PcStatusProps {
    store?: MyStoreType
}

@inject('store')
@observer
class PcStatus extends React.Component<PcStatusProps> {
    render() {
        const {store} = this.props;
        return <ul css={{fontSize:'13px', marginTop:'2px'}}>
            <li>pcA:{store!.pcAtgtId} [{store!.pcAState}] [{store!.dcAState}]</li>
            <li>pcB:{store!.pcBtgtId} [{store!.pcBState}] [{store!.dcBState}]</li>
            <li>pcC:{store!.pcCtgtId} [{store!.pcCState}] [{store!.dcCState}]</li>
        </ul>
    }
}

interface StatusProps {
    store?: MyStoreType
}

@inject('store')
@observer
class Status extends React.Component<StatusProps> {
    render() {
        const {store} = this.props;
        return <React.Fragment>
            <div css={{display:store!.showDetail ? 'block':'none'}}>
                <h2 css={{marginBottom:'2px'}}>status</h2>
                <h4 css={{margin:'4px 0px'}}>id:{store!.id || 'no id'}</h4>
                <PcStatus />
            </div>
        </React.Fragment>
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
            <div className="pure-form pure-form-stacked">
                <h2 css={{marginBottom:'2px'}}>registration</h2>
                <span>email</span>
                <input type="email" className="pure-input-1-3" ref={this.emailRef} />
                <span>password</span>
                <input type="password" className="pure-input-1-3" ref={this.passRef} />
                <span>screen name</span>
                <input type="text" className="pure-input-1-3" ref={this.nameRef} />
                <button className="pure-button" onClick={(ev) => {this.registrationClickHandler(ev)}}>
                    registration
                </button>
            </div>
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
        return <button className="pure-button" onClick={() => {this.logoutClickHandler()}}>logout</button>
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
            <div className="pure-form pure-form-stacked">
                <h2 css={{marginBottom:'2px'}}>login</h2>
                <span>email</span>
                <input type="email" className="pure-input-1-3" ref={this.emailRef} />
                <span>password</span>
                <input type="password" className="pure-input-1-3" ref={this.passRef} />
                <button className="pure-button" onClick={(ev) => {this.loginClickHandler(ev)}}>login</button>
            </div>
        </React.Fragment>
    }
}

interface LoginContainerProps {
    store?: MyStoreType
}

@inject('store')
@observer
class LoginContainer extends React.Component<LoginContainerProps, {login: Boolean}> {
    constructor(props: Readonly<LoginContainerProps>) {
        super(props);
        this.state = {
            login: true
        };
    }
    render() {
        const {store} = this.props;
        return <React.Fragment>
            {store!.logged ? <Logout /> : <React.Fragment>
                <div css={{display:this.state.login ? 'block':'none'}}>
                    <Login />
                    <a href="#" onClick={(ev) => {
                        ev.preventDefault();
                        this.setState({login: false});
                    }}>registration</a>
                </div>
                <div css={{display:this.state.login ? 'none':'block'}}>
                    <Registration />
                    <a href="#" onClick={(ev) => {
                        ev.preventDefault();
                        this.setState({login: true});
                    }}>login</a>
                </div>
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
        return <div className="pure-form">
            <label>
                <span>{store!.name}'s say: </span>
                <input type="text"  className="pure-input-rounded pure-input-1-3"
                    ref={this._inSayRef} disabled={store!.logged ? false:true} />
            </label>
            <span> </span>
            <button className="pure-button" 
                onClick={(ev) => {this.sendClickHandler(ev)}} 
                disabled={store!.logged ? false : true}>send</button>
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

interface AppTitleProps {
    store?: MyStoreType
}

@inject('store')
@observer
class AppTitle extends React.Component<AppTitleProps> {
    render() {
        const {store} = this.props;
        const status = (store!.pcAState === 'connected' && store!.dcAState === 'open') 
            || (store!.pcBState === 'connected' && store!.dcBState === 'open') 
            || (store!.pcCState === 'connected' && store!.dcCState === 'open');
        return <div css={{margin:'8px 0px'}}>
            <h1 css={{display:'inline'}}>messenger</h1>
            <span css={{paddingLeft:'22px'}}></span>
            <h3 css={{display:'inline'}}>status:<span>{status ? 'online':'offline'}</span></h3>
            <span css={{paddingLeft:'22px'}}></span>
            <a href="#" onClick={(ev) => {
                ev.preventDefault();
                store!.setShowDetail(!store!.showDetail);
            }}>show/hide status detail</a>
        </div>
    }
}

const App = () => (
    <Provider store={new MyStore()}>
        <div css={{width: '1024px', margin: '0px auto'}}>
            <AppTitle />
            <Status />
            <LoginContainer />
            <h2 css={{marginBottom:'2px'}}>main</h2>
            <Writer />
            <TimeLine />
        </div>
    </Provider>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);