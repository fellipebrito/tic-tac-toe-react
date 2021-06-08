import React from 'react';
import Board from './board.js'
import { calculateDraw, calculateWinner, winNextMove } from './robot.js';

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            stepNumber: 0,
            xIsNext: true
        };
    }

    gameStatus() {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        return [history, current, squares];
    }

    handleClick(i) {
        const [history, , squares] = this.gameStatus();

        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    robotMove() {
        const [, , squares] = this.gameStatus();
        const doubleWinMove = [(squares[0] === 'X'), (squares[2] === 'X'), (squares[6] === 'X'), (squares[8] === 'X')].filter(function (e) {
            return e === true;
        }).length > 1;
        const crossWinMove = (squares[7] === 'X' && squares[5] === 'X') ? 8 :
            (squares[1] === 'X' && squares[5] === 'X') ? 2 :
                (squares[1] === 'X' && squares[3] === 'X') ? 0 :
                    (squares[7] === 'X' && squares[3] === 'X') ? 6 : undefined;
        const kassyaMove = (squares[0] === 'X' && squares[7] === 'X') ? 6 :
            (squares[2] === 'X' && squares[7] === 'X') ? 8 :
                (squares[0] === 'X' && squares[5] === 'X') ? 2 :
                    (squares[5] === 'X' && squares[6] === 'X') ? 8 :
                        (squares[2] === 'X' && squares[3] === 'X') ? 0 :
                            (squares[3] === 'X' && squares[8] === 'X') ? 6 :
                                (squares[1] === 'X' && squares[8] === 'X') ? 2 :
                                    (squares[1] === 'X' && squares[6] === 'X') ? 0 : undefined;
        console.log(kassyaMove);

        const emptyCorners = [!squares[0], !squares[2], !squares[6], !squares[8]].filter(function (e) {
            return e === true;
        }).length;

        var move = Math.floor(Math.random() * 8);
        var winnerMove = winNextMove(squares);

        if ((winnerMove && !squares[winnerMove]) || winnerMove === 0) {
            console.log('WinnerMove');

            move = winnerMove;
        } else if (!squares[4]) {
            console.log('takeCenter');

            move = 4;
        } else if (crossWinMove !== undefined) {
            console.log('blockCrossWinMove');

            move = crossWinMove;
        } else if (kassyaMove !== undefined) {
            console.log('blockKassyaMove');

            move = kassyaMove;
        } else if (doubleWinMove && emptyCorners > 0) {
            console.log('blockDoubleWinMove');

            var centers = [1, 3, 5, 7];
            move = centers[Math.floor(Math.random() * centers.length)];
        } else if (!squares[0] || !squares[2] || !squares[6] || !squares[8]) {
            console.log('takeCorner');

            var corners = [0, 2, 6, 8];
            move = corners[Math.floor(Math.random() * corners.length)];
        }

        if (!squares[move]) {
            this.handleClick(move);
        } else {
            this.robotMove();
        }
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const [history, current] = this.gameStatus();

        const moves = history.map((step, move) => {
            let difference;
            if (move) {
                difference = step.squares.map((e, i) => e !== history[move - 1].squares[i] ? i + 1 : null).filter(x => x)[0]
            }

            const desc = move ?
                `Go to move # ${move} :: ${(move % 2) ? 'X' : 'O'} to ${difference}` :
                'Go to game start';

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{this.statusText(current)}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }

    statusText(current) {
        const winner = calculateWinner(current.squares);
        const draw = calculateDraw(current.squares);

        let status;
        if (winner) {
            status = `Winner: ${winner}`;
        } else if (draw) {
            status = 'It is a boring draw';
        } else {
            status = `Next player: ${(this.state.xIsNext ? 'X' : 'O')}`;
        }

        return status;
    }

    shouldWeContinuePlaying() {
        const [, , squares] = this.gameStatus();
        return (!this.state.xIsNext && !calculateDraw(squares) && !calculateWinner(squares));
    }

    componentDidMount() {
        if (this.shouldWeContinuePlaying()) {
            this.robotMove();
        }
    }

    componentDidUpdate() {
        if (this.shouldWeContinuePlaying()) {
            this.robotMove();
        }
    }
}

export default Game;
