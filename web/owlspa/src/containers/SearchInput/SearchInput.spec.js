import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import SearchInput from './SearchInput';

const middleware = [thunk];
const mockStore = configureStore(middleware);

describe('SearchInput', () => {
  let store;

  beforeEach(()=>{
    const initialState = {
      patchListSearch: { searchTerm: 'oskillator' }
    };
    store = mockStore(initialState);
    store.dispatch = sinon.spy();
  });

  it('can be imported', () => {
    expect(SearchInput).to.exist;
  });

  it('is a constructor function', () => {
    expect(SearchInput).to.be.a('function');
  });

  it('renders a text input field', () => {
    const wrapper = mount(
      <Provider store={store}>
        <SearchInput />
      </Provider>
    );
    expect(wrapper.find('input').props().type).to.equal('text');
  });

  it('renders the correct value from the store in the input', () => {
    const wrapper = mount(
      <Provider store={store}>
        <SearchInput />
      </Provider>
    );
    const inputValue = wrapper.find('input').props().value;
    expect(inputValue).to.equal('oskillator');
  });

  it('onChangeHandler results in correct action being sent', () => {
    const wrapper = mount(
      <Provider store={store}>
        <SearchInput />
      </Provider>
    );
    const mockEvent = {target: { value: 'hummus'}};
    const action = {
      type: SET_PATCHLIST_SEARCH_TERM,
      searchTerm: mockEvent.target.value
    };
    const input = wrapper.find('input');
    input.simulate('change', mockEvent);
    expect(store.dispatch.calledWith(action)).to.be.true;
  });

});
