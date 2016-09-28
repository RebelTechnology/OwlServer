import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { CompilationTypeSelector } from 'components';

describe('CompilationTypeSelector', () => {
  let compilationType = 'pd';
  let onSelectorChange = sinon.spy();
  let allTypes = ['cpp', 'pd', 'faust', 'gen'];
  let wrapper = mount(
    <CompilationTypeSelector 
      compilationType={ compilationType } 
      allTypes={allTypes}
      onSelectorChange={ onSelectorChange }/>
  );

  it('can be imported from components', () => {
    expect(CompilationTypeSelector).to.exist;
  });

  it('is a constructor function', () => {
    expect(CompilationTypeSelector).to.be.a('function');
  });

  it('should not render anything if no compilationType or allTypes props are set', () => {    
    let emptyWrapper = mount(
      <CompilationTypeSelector />
    );
    const fieldset = emptyWrapper.find('fieldset');
    const select = emptyWrapper.find('select');
    expect(fieldset).to.have.length(0);
    expect(select).to.have.length(0);
  });

  it('renders a fieldset', () => {    
    const fieldset = wrapper.find('fieldset');
    expect(fieldset).to.have.length(1);
  });

  it('renders a select dropdown', () => {
    const fieldset = wrapper.find('select');
    expect(fieldset).to.have.length(1);
  });

  it('renders an option for each compilation type', () => {
    const fieldset = wrapper.find('option');
    expect(fieldset).to.have.length(4);
  });

  it('selects the correct option onload', () => {
    const select = wrapper.find('select');
    expect(select.props().value).to.equal('pd');
  });

  it('onChaneHandler is called with correct value on select val change', () => {
    let wrapper = shallow(
      <CompilationTypeSelector 
        compilationType={ compilationType } 
        allTypes={allTypes}
        onSelectorChange={ onSelectorChange }/>
    );
    const select = wrapper.find('select');
    const mockEvent = {target :{ value : 'gen'}};
    select.simulate('change', mockEvent);
    expect(onSelectorChange.calledOnce).to.be.true;
    expect(onSelectorChange.calledWith(mockEvent.target.value)).to.be.true;
  });

      
});
