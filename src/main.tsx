import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observer, inject, Provider} from 'mobx-react';
import {MyStore, MyStoreType} from './store';

const store = new MyStore();

interface HeaderProps {
    store?: MyStoreType
}

@inject('store')
@observer
class MyHeader extends React.Component<HeaderProps> {
    render() {
        const {store} = this.props;
        return <h1>id:{store!.id || 'no id'}</h1>
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
            <li>pcA:{store!.pcAtgtId} [{store!.pcAState}]</li>
            <li>pcB:{store!.pcBtgtId} [{store!.pcBState}]</li>
            <li>pcC:{store!.pcCtgtId} [{store!.pcCState}]</li>
        </ul>
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
    nameChangeHandler(ev: React.ChangeEvent<HTMLInputElement>) {
        console.log(ev.currentTarget.value);
        this.props.store!.setName(ev.currentTarget.value);
    }
    sendClickHandler(ev: React.MouseEvent) {
        console.log(ev);
        console.log(this._inSayRef.current!.value);
    }
    render() {
        const {store} = this.props;
        return <div>
            <label>
                <span>name</span>
                <input type="text" 
                    onChange={(ev) => {this.nameChangeHandler(ev)}}
                    value={store!.name} />
            </label>
            <label>
                <span> say</span>
                <input type="text" ref={this._inSayRef} />
            </label>
            <span> </span>
            <button onClick={(ev) => {this.sendClickHandler(ev)}}>send</button>
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
        const child = store!.timeLine.map(e => {
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
    <Provider store={store}>
        <React.Fragment>
            <MyHeader />
            <PcStatus />
            <Writer />
            <TimeLine />
        </React.Fragment>
    </Provider>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);

console.log(store.id);
store.createWs();
store.createPCA();
store.createPCB();
store.createPCC();
console.log(store.pcA, store.pcB, store.pcC);