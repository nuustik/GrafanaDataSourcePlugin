import React, { useState } from 'react';
import { CdpVariableQuery } from './../types';

interface VariableQueryProps {
  query: CdpVariableQuery;
  onChange: (query: CdpVariableQuery, definition: string) => void;
}

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ onChange, query }) => {
  const [state, setState] = useState(query);

  const saveQuery = () => {
    onChange(state, `${state.modelName} (${state.path})`);
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
        />
      </div>
      <div className="gf-form">
        <span className="gf-form-label width-10">Model Name</span>
        <input
          name="modelName"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={state.modelName}
        />
      </div>
    </>
  );
};
