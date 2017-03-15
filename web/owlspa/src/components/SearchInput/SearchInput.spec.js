import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import connectedSearchInput, { SearchInput } from './SearchInput';

describe('SearchInput', () => {

  it('can be imported', () => {
    expect(SearchInput).to.exist;
  });

  it('is a constructor function', () => {
    expect(SearchInput).to.be.a('function');
  });

  it('renders a text input field', () => { 
    const wrapper = shallow(<SearchInput patchListSearch={{searchTerm:''}} />);
    expect(wrapper.find('input').props().type).to.equal('text');
  });

  // it('renders a value if one is supplied', () => {
  //   const wrapper = mount(<SearchInput onChange={()=>{}} value="oskillator" />);
  //   const inputValue = wrapper.find('input').props().value;
  //   expect(inputValue).to.equal('oskillator');
  // });

  // it('onChangeHandler is called with correct value on change', () => {
  //   let onSearchValueChange = sinon.spy();
  //   let wrapper = mount(
  //     <SearchInput 
  //       value="chicken"
  //       onChange={ onSearchValueChange }/>
  //   );
  //   const mockEvent = {target :{ value : 'hummus'}};
  //   const input = wrapper.find('input');
  //   input.simulate('change', mockEvent);
  //   expect(onSearchValueChange.calledOnce).to.be.true;
  //   expect(onSearchValueChange.calledWith(mockEvent.target.value)).to.be.true;
  // });
      
});
