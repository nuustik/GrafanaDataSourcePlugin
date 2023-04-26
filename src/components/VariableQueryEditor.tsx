import React, { useState } from 'react';
import { CdpVariableQuery } from './../types';

interface VariableQueryProps {
  query: CdpVariableQuery;
  onChange: (query: CdpVariableQuery, definition: string) => void;
}

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ onChange, query }) => {
  const [state, setState] = useState(query);

  const saveQuery = () => {
    onChange(state, `${state.modelNames} (${state.path})`);
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) =>
    setState({
      ...state,
      [event.currentTarget.name]: event.currentTarget.value,
    });

  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label width-10">Node Path</span>
        <input
          name="path"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={state.path}
          placeholder="CDP node path to search for children. E.g. AppName.CompName.*"
        />
      </div>
      <div className="gf-form">
        <span className="gf-form-label width-10">Model Name</span>
        <input
          name="modelNames"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={state.modelNames}
          placeholder="Optional, filter by CDP node model names. E.g. CDPSignal*;CDPSignalChannel<double>"
        />
      </div>
      <div className="gf-form">
        <span className="gf-form-label width-10">Remove Prefix</span>
        <input
          name="removedPrefix"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={state.removedPrefix}
          placeholder="Optional, remove prefix from results. E.g AppName.CompName."
        />
      </div>
    </>
  );
};
