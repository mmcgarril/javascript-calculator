import './App.css';
import { Component } from "react";

class App extends Component {
  constructor(props) {
        super(props)
        this.state = {
            history: '',
            display: '0',
            disabled: ''
        }
        this.multiply = (a, b) => {
            return a * b;
        }
        this.divide = (a, b) => {
            return a / b;
        }
        this.add = (a, b) => {
            return a + b;
        }
        this.subtract = (a, b) => {
            return a - b;
        }
        this.operators = ["*", '/', "+", "-"]
           
        this.handleEquals = this.handleEquals.bind(this)
        this.handleClear = this.handleClear.bind(this)
  }

  handleNum(char) {
    //guard to prevent user input of large numbers which can't be displayed
    if (this.state.display.length >= 20) {
      const currentDisplay = this.state.display
      this.setState({
        display: 'DIGIT LIMIT MET',
        disabled: 'true'
      })
      setTimeout(() => {
        this.setState({
          display: currentDisplay,
          disabled: ''
        })}, 2000
      )
    }
    else {
      if (this.state.history.includes('=')) {
        this.setState({
          history: '',
          display: ''
        })
      }
      if (char === '0' && this.state.history === '') {
        this.setState({
            history: '0',
            display: '0'
        })
      }
      else {
        if (this.operators.includes(this.state.display)) {
          this.setState(() => {
             return {
                display: ''
              }
          })
        }
        if (this.state.display === '0') {
          this.setState({
            history: '',
            display: ''
         })
        }
        this.setState((state) => {
          const currentInput = state.history
          const currentResult = state.display
          return {
            history: currentInput + char,
            display: currentResult + char
          }
        })  
      }
    }
  }

  handleDecimal() {
    if (this.state.history.includes('=')) {
      this.handleClear()
    }
    //add zero 
    if (this.state.history === '' || this.operators.includes(this.state.display)) {
      const currentHistory = this.state.history
      this.setState({
        history: currentHistory + '0',
        display: '0'
      })
    }
    //don't allow consecutive decimals
    if (!this.state.display.includes('.')) {
        this.setState((state) => {
            const currentInput = state.history
            const currentResult = state.display
            return {
                history: currentInput + '.',
                display: currentResult + '.'
            }
        })  
    }   
  }
  //reuse diplay, clear history
  nextOperation = (char) => {
    this.setState((state) => {
      const currentDisplay = state.display
      return {
        history: currentDisplay + char,
        display: char
      }
    })
  }
    
  handleOperator(char) {   
    if (this.state.history.includes('=')) {
      this.nextOperation(char)
    }
    else {
      const prevChar = this.state.history[this.state.history.length - 1]
      const secondPrevChar = this.state.history[this.state.history.length - 2]
      //replaces a previous operator
      if (this.operators.includes(prevChar)) {
        this.setState((state) => {
          const currentHistory = state.history
          return {
            history: currentHistory.slice(0, -1)
          }
        })
        //replaces second previous operator (in case user input is digit, operator, minus, opertator)
        if (this.operators.includes(secondPrevChar)) {
          this.setState((state) => {
            const currentHistory = state.history
            return {
              history: currentHistory.slice(0, -1)
            }
          })
        }
      }
      this.setState((state) => {
        const currentHistory = state.history
        return {
          history: currentHistory + char,
          display: char
        }
      })
    }       
  }

  handleMinus(char) {
    if (this.state.history.includes('=')) {
      this.nextOperation(char)
    }
    else {
      //only replaces + or -, becomes negative symbol following * or /
      const prevChar = this.state.history[this.state.history.length - 1]
      if (prevChar === '-') {
        this.setState((state) => {
          const currentHistory = state.history
          return {
            history: currentHistory.slice(0, -1)
          }
        })
      }
      this.setState((state) => {
        const currentHistory = state.history
        return {
          history: currentHistory + char,
          display: char
        }
      })
    }
  }

  handleEquals() {
    this.setState((state) => {
      let currentHistory = state.history
      //disable entering equal twice in a row
      if (!currentHistory.includes('=')) {
        //if last char is * / + -, remove
        if (this.operators.includes(currentHistory[currentHistory.length - 1])) {
          currentHistory = currentHistory.slice(0, -1)
        }
        //initalize array to separate history into multi-digits and operators
        let historyArray = []
        let counter = 0
        const regex = /\d/
        for (let i = 0; i <= currentHistory.length -1; i++) {
          //initial new element 
          if (!historyArray[counter]) {
            historyArray[counter] = ''
          }
          //for digit or decimal, add to array but don't increment counter
          if (currentHistory[i].match(regex) || currentHistory[i] === '.') {
            historyArray[counter] += currentHistory[i]
          }
          //for '-', add and don't increment only if used as negative (first char or following another operator)
          else if (currentHistory[i] === '-' && (i === 0 || this.operators.includes(currentHistory[i - 1]))) {
            historyArray[counter] += currentHistory[i]
          }
          else {
            counter++;
            historyArray[counter] = '' + currentHistory[i];
            counter++;
          }
        }
        //while an operator exists in array, combine with previous and next elements using functions (until one element exists)
        while (historyArray.includes('*')) {
          const index = historyArray.indexOf('*');
          historyArray.splice(index - 1, 3, this.multiply(parseFloat(historyArray[index - 1]), parseFloat(historyArray[index + 1])).toFixed(15))
        }
        while (historyArray.includes('/')) {
          const index = historyArray.indexOf('/');
          historyArray.splice(index - 1, 3, this.divide(parseFloat(historyArray[index - 1]), parseFloat(historyArray[index + 1])).toFixed(15))
        }
        while (historyArray.includes('-')) {
          const index = historyArray.indexOf('-');
          historyArray.splice(index - 1, 3, this.subtract(parseFloat(historyArray[index - 1]), parseFloat(historyArray[index + 1])))
        }
        while (historyArray.includes('+')) {
          const index = historyArray.indexOf('+');
          historyArray.splice(index - 1, 3, this.add(parseFloat(historyArray[index - 1]), parseFloat(historyArray[index + 1])))
        }
        //remove trailing zeros or useless decimal point
        let answer = historyArray[0].toString()
        while ((answer.includes('.') && answer.charAt(answer.length - 1) === '0') || answer[answer.length -1] === '.') {
          answer = answer.slice(0, -1)
        }

        return {
          history: currentHistory + '=' + answer,
          display: answer
        }    
      }
    })
  }
 
  handleClear() {
    this.setState({
      history: '',
      display: '0'
    })
  }

  render() {
    return <div id="calculator-body">
      <div id="history">{this.state.history}</div>
      <div id="display">{this.state.display}</div>
      <div id="buttons">
        <button id="clear" class="red btn" onClick={this.handleClear}>AC</button>
        <button id="divide" class="square light-grey btn" disabled={this.state.disabled} value="/" onClick={(e) => this.handleOperator(e.target.value)}>/</button>
        <button id="multiply" class="square light-grey btn" disabled={this.state.disabled} value="*" onClick={(e) => this.handleOperator(e.target.value)}>X</button>
        <button id="seven" class="square dark-grey btn" disabled={this.state.disabled} value="7" onClick={(e) => this.handleNum(e.target.value)}>7</button>
        <button id="eight" class="square dark-grey btn" disabled={this.state.disabled} value="8" onClick={(e) => this.handleNum(e.target.value)}>8</button>
        <button id="nine" class="square dark-grey btn"  disabled={this.state.disabled} value="9" onClick={(e) => this.handleNum(e.target.value)}>9</button>
        <button id="subtract" class="square light-grey btn" disabled={this.state.disabled} value="-" onClick={(e) => this.handleMinus(e.target.value)}>-</button>
        <button id="four" class="square dark-grey btn" disabled={this.state.disabled} value="4" onClick={(e) => this.handleNum(e.target.value)}>4</button>
        <button id="five" class="square dark-grey btn" disabled={this.state.disabled} value="5" onClick={(e) => this.handleNum(e.target.value)}>5</button>        
        <button id="six" class="square dark-grey btn" disabled={this.state.disabled} value="6" onClick={(e) => this.handleNum(e.target.value)}>6</button>
        <button id="add" class="square light-grey btn" disabled={this.state.disabled} value="+" onClick={(e) => this.handleOperator(e.target.value)}>+</button>
        <button id="one" class="square dark-grey btn" disabled={this.state.disabled} value="1" onClick={(e) => this.handleNum(e.target.value)}>1</button>
        <button id="two" class="square dark-grey btn" disabled={this.state.disabled} value="2" onClick={(e) => this.handleNum(e.target.value)}>2</button>
        <button id="three" class="square dark-grey btn" disabled={this.state.disabled} value="3" onClick={(e) => this.handleNum(e.target.value)}>3</button>
        <button id="equals" class="blue btn" disabled={this.state.disabled} onClick={this.handleEquals}>=</button>
        <button id="zero" class="dark-grey btn" disabled={this.state.disabled} value="0" onClick={(e) => this.handleNum(e.target.value)}>0</button>
        <button id="decimal" class="square dark-grey btn" disabled={this.state.disabled} value="." onClick={(e) => this.handleDecimal(e.target.value)}>.</button>
      </div>
  </div>
  }
}

export default App;