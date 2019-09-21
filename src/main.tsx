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

interface BodyProps {
    store?: MyStoreType
}

@inject('store')
@observer
class MyBody extends React.Component<BodyProps> {
    render() {
        const {store} = this.props;
        return <ul>
            <li>pcA:{store!.pcAtgtId}</li>
            <li>pcB:{store!.pcBtgtId}</li>
            <li>pcC:{store!.pcCtgtId}</li>
        </ul>
    }
}

const App = () => (
    <Provider store={store}>
        <React.Fragment>
            <MyHeader />
            <MyBody />
        </React.Fragment>
    </Provider>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);

console.log(store.id);
store.createPCA();
store.createPCB();
store.createPCC();
console.log(store.pcA, store.pcB, store.pcC);
store.createWs();