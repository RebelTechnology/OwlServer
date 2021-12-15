import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { CompilationTypeSelector } from 'components';

describe('CompilationTypeSelector', () => {
  const compilationType = 'pd';
  const onCompilationTypeChange = sinon.spy();
  const mockMainFile = {name: "fakefile.hpp", path: "fakefile.hpp", type: "gitHub", mainFile: true, timeStamp: 1475156840382};
  let wrapper = mount(
    <CompilationTypeSelector
      mainSourceFile={mockMainFile}
      compilationType={ compilationType }
      onCompilationTypeChange={ onCompilationTypeChange }/>
  );

  it('can be imported from components', () => {
    expect(CompilationTypeSelector).to.exist;
  });

  it('is a constructor function', () => {
    expect(CompilationTypeSelector).to.be.a('function');
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

  it('onChangeHandler is called with correct value on select val change', () => {
    let onCompilationTypeChange = sinon.spy();
    let wrapper = mount(
      <CompilationTypeSelector
        compilationType={ compilationType }
        onCompilationTypeChange={ onCompilationTypeChange }/>
    );
    const mockEvent = {target: { value: 'gen'}};
    const select = wrapper.find('select');
    select.simulate('change', mockEvent);
    expect(onCompilationTypeChange.calledOnce).to.be.true;
    expect(onCompilationTypeChange.calledWith(mockEvent.target.value)).to.be.true;
  });


  describe('onChangeHandler returns correct comilationType when mainFileName is passed in', () => {

    it('.pd files should return \'pd\' compilation type', () => {
      const onCompilationTypeChange = sinon.spy();
      const mockMainFile = {name: "fakefile.pd", path: "fakefile.pd", type: "gitHub", mainFile: true, timeStamp: 1475156840382};
      let wrapper = mount(
        <CompilationTypeSelector
          compilationType={ compilationType }
          onCompilationTypeChange={ onCompilationTypeChange }
          mainSourceFile={ mockMainFile } />
      );

      expect(onCompilationTypeChange.calledOnce).to.be.true;
      expect(onCompilationTypeChange.calledWith('pd')).to.be.true;
    });

    it('.dsp files should return \'faust\' compilation type', () => {
      const onCompilationTypeChange = sinon.spy();
      const mockMainFile = {name: "fakefile.dsp", path: "fakefile.dsp", type: "gitHub", mainFile: true, timeStamp: 1475156840382};
      let wrapper = mount(
        <CompilationTypeSelector
          compilationType={ compilationType }
          onCompilationTypeChange={ onCompilationTypeChange }
          mainSourceFile={ mockMainFile } />
      );

      expect(onCompilationTypeChange.calledOnce).to.be.true;
      expect(onCompilationTypeChange.calledWith('faust')).to.be.true;
    });

    it('other files should return \'cpp\' compilation type', () => {
      const onCompilationTypeChange = sinon.spy();
      const mockMainFile = {name: "fakefile.hpp", path: "fakefile.hpp", type: "gitHub", mainFile: true, timeStamp: 1475156840382};
      let wrapper = mount(
        <CompilationTypeSelector
          compilationType={ compilationType }
          onCompilationTypeChange={ onCompilationTypeChange }
          mainSourceFile={ mockMainFile } />
      );

      expect(onCompilationTypeChange.calledOnce).to.be.true;
      expect(onCompilationTypeChange.calledWith('cpp')).to.be.true;
    });
  });


});
