import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observer, inject, Provider} from 'mobx-react';
import {MyStore, MyStoreType} from './store';

const store = new MyStore();

const App = () => (
    <Provider store={store}>
        <React.Fragment>
            <h1>hello world!!</h1>
        </React.Fragment>
    </Provider>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);

console.log(store.id);
store.createPCA();
console.log(store.pcA);
store.createWs();
console.log(store.ws);