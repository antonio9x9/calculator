import React, { useState, useRef, useCallback } from 'react';
import './Main.css';

import Button from '../components/Button';

function App() {

  enum MathOperation {
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    Divide = '/',
    None = '0',
    Mod = '%',
    Result = '='
  }

  const divRef = useRef<HTMLDivElement>(null);

  const [displayText, SetDisplayText] = useState<string>('0');
  const [currentResult, SetCurrentResult] = useState<number>(0);
  const [displayHistory, SetDisplayHistory] = useState<any[]>([]);

  const [currentOperation, SetCurrentOperation] = useState<MathOperation>(MathOperation.None);
  const [lastValue, SetLastValue] = useState<number>(0);

  const [canResetDisplay, SetCanResetDisplay] = useState<boolean>(false);
  const [isDotAdded, SetIsDotAdded] = useState<boolean>(false);
  const [canResetOperation, SetCanResetOperation] = useState<boolean>(false);

  function UpdateDisplayValue(value: string) {
    if (displayText == '0') {
      SetDisplayText(value);
    }
    else if (canResetOperation) {
      ResetDisplay();
      SetDisplayText(value);
    }
    else if (canResetDisplay) {
      SetDisplayText(value);
      SetCanResetDisplay(false);
    }
    else {
      SetDisplayText(displayText + value);
    }
  }

  function ResetDisplay() {
    SetDisplayText('0');
    SetDisplayHistory([]);
    SetCurrentOperation(MathOperation.None);
    SetCanResetDisplay(false);
    SetCanResetOperation(false);
    SetIsDotAdded(false);
  }

  function ChangeDisplayValueSignal() {
    SetDisplayText(displayText.charAt(0) === '-' ? displayText.substr(1) : '-' + displayText);
    SetCurrentResult(currentResult * -1);

    SetCanResetDisplay(false);
  }

  function parseStringToMathOperation(value: string): MathOperation {
    switch (value) {
      case '+':
        return MathOperation.Add;
      case '-':
        return MathOperation.Subtract;
      case '*':
        return MathOperation.Multiply;
      case '/':
        return MathOperation.Divide;
      case '%':
        return MathOperation.Mod;
      default:
        return MathOperation.None;
    }
  }

  function GetCurrentCalculationValue(result: number, currentOperation: MathOperation, valueToUse: string): number {
    switch (currentOperation) {
      case MathOperation.Add:
        result += parseFloat(valueToUse);
        break;
      case MathOperation.Subtract:
        result -= parseFloat(valueToUse);
        break;
      case MathOperation.Multiply:
        result *= parseFloat(valueToUse);
        break;
      case MathOperation.Divide:
        result /= parseFloat(valueToUse);
        break;
      case MathOperation.Mod:
        result %= parseFloat(valueToUse);
        break;
      default:
        break;
    }
    return result;
  }

  function HandleAddDot() {
    if (canResetOperation) {
      ResetDisplay();
      SetDisplayText('0.');
      SetIsDotAdded(true);
      SetCanResetOperation(false);
    }
    else if (canResetDisplay) {
      SetDisplayText('0.');
      SetIsDotAdded(true);
      SetCanResetDisplay(false);
    }
    else if (!isDotAdded && displayText.indexOf('.') === -1) {
      SetDisplayText(displayText + '.');
      SetIsDotAdded(true);
    }
  }

  function UpdateCurrentOperation(value: string) {
    if (canResetOperation) {
      let newHistory = [parseFloat(displayText), value];
      SetDisplayHistory([...newHistory]);

      let nextOperation = parseStringToMathOperation(value);
      SetCurrentOperation(nextOperation);

      SetCanResetOperation(false);
      SetCanResetDisplay(true);
    }
    else if (canResetDisplay) {
      let newHistory = [...displayHistory];
      newHistory.pop();
      newHistory.push(value);

      SetDisplayHistory([...newHistory]);
    }
    else {
      SetCanResetDisplay(true);

      let nextOperation = parseStringToMathOperation(value);
      SetCurrentOperation(nextOperation);

      let newHistory = [...displayHistory, parseFloat(displayText), nextOperation];
      SetDisplayHistory([...newHistory]);

      let result = 0;
      if (newHistory.length > 2) {
        result = parseFloat(newHistory[0]);

        for (let index = 1; index < newHistory.length - 1; index += 1) {
          const nextValue = newHistory[index + 1];
          const operation = newHistory[index];

          switch (operation) {
            case MathOperation.Add:
              result += parseFloat(nextValue);
              break;
            case MathOperation.Subtract:
              result -= parseFloat(nextValue);
              break;
            case MathOperation.Multiply:
              result *= parseFloat(nextValue);
              break;
            case MathOperation.Divide:
              result /= parseFloat(nextValue);
              break;
            case MathOperation.Mod:
              result %= parseFloat(nextValue);
              break;
            default:
              break;
          }
        }
      }
      else {
        result = parseFloat(displayText);
      }

      SetDisplayText(result.toString());
      SetCurrentResult(result);
      SetIsDotAdded(false);
    }
  }

  function DoCalculation() {
    if (canResetOperation) {
      let newHistory = [currentResult, currentOperation, lastValue, MathOperation.Result];
      SetDisplayHistory([...newHistory]);

      let result = GetCurrentCalculationValue(currentResult, currentOperation, lastValue.toString());
      SetDisplayText(result.toString());
      SetCurrentResult(result);
    }
    else {
      let newHistory = [...displayHistory];
      newHistory.push(displayText);
      newHistory.push(MathOperation.Result);
      SetDisplayHistory([...newHistory]);

      SetLastValue(parseFloat(displayText));

      let result = GetCurrentCalculationValue(currentResult, currentOperation, displayText);
      SetDisplayText(result.toString());
      SetCurrentResult(result);

      SetCanResetOperation(true);
    }
  }

  function EreaseTheLastCharacter() {
    if (displayText.length === 1) {
      SetDisplayText('0');
    } else {

      if (displayText.charAt(displayText.length - 1) === '.') {
        SetIsDotAdded(false);
      }

      SetDisplayText(displayText.substr(0, displayText.length - 1));
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    switch (event.key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        UpdateDisplayValue(event.key);
        break;
      case '.':
      case ',':
        HandleAddDot();
        break;
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        UpdateCurrentOperation(event.key);
        break;
      case 'Enter':
        DoCalculation();
        break;
      case 'Backspace':
        EreaseTheLastCharacter();
        break;
      case 'Escape':
        ResetDisplay();
        break;
      default:
        break;
    }
  }

  return (
    <div className="container" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="calculator">
        <div className='displayResult'>
          <div className='displayResultHistory'>
            {displayHistory.join(' ')}
          </div>
          <div className='displayResultText'>
            {displayText}
          </div>
        </div>
        <div className="buttons">
          <div className="row">
            <Button onClick={ResetDisplay} onKeyDown={handleKeyDown} label="C" />
            <Button onClick={ChangeDisplayValueSignal} onKeyDown={handleKeyDown} label="+/-" />
            <Button onClick={() => UpdateCurrentOperation('%')} onKeyDown={handleKeyDown} label="%" />
            <Button onClick={() => UpdateCurrentOperation('/')} onKeyDown={handleKeyDown} label="/" />
          </div>
          <div className="row">
            <Button onClick={() => UpdateDisplayValue('7')} onKeyDown={handleKeyDown} label="7" />
            <Button onClick={() => UpdateDisplayValue('8')} onKeyDown={handleKeyDown} label="8" />
            <Button onClick={() => UpdateDisplayValue('9')} onKeyDown={handleKeyDown} label="9" />
            <Button onClick={() => UpdateCurrentOperation('*')} onKeyDown={handleKeyDown} label="X" />
          </div>
          <div className="row">
            <Button onClick={() => UpdateDisplayValue('4')} onKeyDown={handleKeyDown} label="4" />
            <Button onClick={() => UpdateDisplayValue('5')} onKeyDown={handleKeyDown} label="5" />
            <Button onClick={() => UpdateDisplayValue('6')} onKeyDown={handleKeyDown} label="6" />
            <Button onClick={() => UpdateCurrentOperation('-')} onKeyDown={handleKeyDown} label="-" />
          </div>
          <div className="row">
            <Button onClick={() => UpdateDisplayValue('1')} onKeyDown={handleKeyDown} label="1" />
            <Button onClick={() => UpdateDisplayValue('2')} onKeyDown={handleKeyDown} label="2" />
            <Button onClick={() => UpdateDisplayValue('3')} onKeyDown={handleKeyDown} label="3" />
            <Button onClick={() => UpdateCurrentOperation('+')} onKeyDown={handleKeyDown} label="+" />
          </div>
          <div className="row">
            <Button onClick={() => UpdateDisplayValue('0')} onKeyDown={handleKeyDown} label="0" />
            <Button onClick={() => UpdateDisplayValue('.')} onKeyDown={handleKeyDown} label="." />
            <Button onClick={EreaseTheLastCharacter} onKeyDown={handleKeyDown} label="←" />
            <Button onClick={DoCalculation} onKeyDown={handleKeyDown} label="=" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
