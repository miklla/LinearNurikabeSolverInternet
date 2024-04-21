let nrows = 5
let ncols = 5
const MIN_NROWS = 3
const MIN_NCOLS = 3
const WHITE = 'w'
const BLACK = 'b'
const UNKN = 'u'
const SOLVER_UNKN = -3
const SOLVER_BLACK = -2
const SOLVER_WHITE = -1

// history actions
const ACTION_COLOR = 'c'
const ACTION_NUMBER = 'n'
const ACTION_ADD_ROW_TOP = 'r'
const ACTION_ADD_ROW_BOTTOM = 's'
const ACTION_REMOVE_ROW_TOP = 'q'
const ACTION_REMOVE_ROW_BOTTOM = 'p'
const ACTION_ADD_COL_TOP = 'a'
const ACTION_ADD_COL_BOTTOM = 'b'
const ACTION_REMOVE_COL_TOP = 'd'
const ACTION_REMOVE_COL_BOTTOM = 'e'

const REASON_USER = '0'

let history = []
let cur_history = 0  // applied 0 .. (cur_history-1) actions

let edit_cell_x = 0
let edit_cell_y = 0
 
const gameBoard = document.getElementById("gameBoard")
let board = []

const MODE_EDIT = 'e'
const MODE_PLAY = 'p'
let g_mode = MODE_EDIT
 
function initialize_board() {
    for (let x = 0; x < ncols; ++x) {
        board[x] = []
        for (let y = 0; y < nrows; ++y) {
            board[x][y] = {number: 0, color: UNKN, mistake: false}
        }
    }

    board[3][0].number = 3
    board[0][1].number = 2
    board[4][3].number = 4
    board[1][4].number = 1
 
    for (let x = 0; x < ncols; ++x) {
        for (let y = 0; y < nrows; ++y) {
            if(board[x][y].number > 0) {
                board[x][y].color = WHITE
            }
        }
    }
}

function left_click_cell(x, y) {
    if (x < 0 || x >= ncols || y < 0 || y >= nrows) {
        alert("er2")
        return
    }

    if(g_mode === MODE_PLAY) {
        if(board[x][y].number > 0) {
            return
        }

        const old_color = board[x][y].color
        if(old_color === UNKN || old_color === WHITE) {
            action_set_color(x, y, BLACK, REASON_USER)
        } else if(old_color === BLACK) {
            action_set_color(x, y, UNKN, REASON_USER)
        } else {
            alert("error")
        }
    } else if(g_mode === MODE_EDIT) {
        if(edit_cell_x === x && edit_cell_y === y) {
            board[x][y].number += 1
            if(board[x][y].number === 1000) {
                board[x][y].number = 0
                board[x][y].color = UNKN
            } else {
                board[x][y].color = WHITE
            }
        } else {
            edit_cell_x = x
            edit_cell_y = y
        }
    } else {
        alert("error")
    }

    handle_board_after_change()
    render_board()
}

function right_click_cell(x, y) {
    if (x < 0 || x >= ncols || y < 0 || y >= nrows) {
        alert("er2")
        return
    }

    if(g_mode === MODE_PLAY) {
        if(board[x][y].number > 0) {
            return
        }

        const old_color = board[x][y].color
        if(old_color === UNKN || old_color === BLACK) {
            action_set_color(x, y, WHITE, REASON_USER)
        } else if(old_color === WHITE) {
            action_set_color(x, y, UNKN, REASON_USER)
        } else {
            alert("error")
        }
    } else if(g_mode === MODE_EDIT) {
        if(edit_cell_x === x && edit_cell_y === y) {
            if(board[x][y].number != 0) {
                board[x][y].number -= 1
                if(board[x][y].number === 0) {
                    board[x][y].color = UNKN
                }
            } else {
                board[x][y].number = 999
                board[x][y].color = WHITE
            }
        } else {
            edit_cell_x = x
            edit_cell_y = y
        }
    } else {
        alert("error")
    }

    handle_board_after_change()
    render_board();
}

function action_set_color(x, y, next, reason) {
    if(x >= ncols || y >= nrows) {
        alert("set x y error")
    }
    if(next === board[x][y].color) {
        alert("set color error" + x + y + next + board[x][y].color)
    }

    if(cur_history >= history.length) {
        history.push({})
    } else {
        history.length = cur_history + 1
    }

    history[cur_history].x = x;
    history[cur_history].y = y;
    history[cur_history].prev = board[x][y].color
    history[cur_history].next = next
    history[cur_history].type = ACTION_COLOR
    history[cur_history].reason = reason

    history_forward()
}

function action_set_number(x, y, next) {
    if(x >= ncols || y >= nrows) {
        alert("set x y error")
    }
    if(next === board[x][y].number) {
        alert("set number error")
    }

    if(cur_history >= history.length) {
        history.push({})
    } else {
        history.length = cur_history + 1
    }

    history[cur_history].x = x;
    history[cur_history].y = y;
    history[cur_history].prev = board[x][y].number
    history[cur_history].next = next
    history[cur_history].type = ACTION_NUMBER

    history_forward()
}

function history_forward() {
    if(cur_history >= history.length) {
        alert("error1")
    }
    const h = history[cur_history]

    if(h.type === ACTION_COLOR) {
        if(board[h.x][h.y].color != h.prev) {
            alert("error2")
        }
        board[h.x][h.y].color = h.next
    } else if (h.type === ACTION_NUMBER) {
        if(board[h.x][h.y].number != h.prev) {
            alert("error3")
        }
        board[h.x][h.y].number = h.next
    } else {
        alert("history error")
    }

    cur_history += 1
}

function history_backward() {
    if(cur_history <= 0) {
        alert("error")
    }
    cur_history -= 1

    if(history[cur_history].type === ACTION_COLOR) {
        if(board[x][y].color != next) {
            alert("error")
        }
        board[x][y].color = prev
    } else if (history[cur_history].type === ACTION_NUMBER) {
        if(board[x][y].number != next) {
            alert("error")
        }
        board[x][y].number = prev
    } else {
        alert("history error")
    }
}

function handle_board_after_change() {
    let nunkn = 0;
    for(let xx = 0; xx < ncols; ++xx)
        for(let yy = 0; yy < nrows; ++yy) {
            if(board[xx][yy].color === UNKN) {
                ++nunkn
            }
        }

    gameBoard.classList.remove("solved_board_correct")
    gameBoard.classList.remove("solved_board_incorrect")
    for(let xx = 0; xx < ncols; ++xx)
        for(let yy = 0; yy < nrows; ++yy)
            board[xx][yy].mistake = false
    
    if (nunkn === 0) {
        // Handle game over
        is_correct = handle_full_board()

        if(is_correct) {
            gameBoard.classList.add("solved_board_correct")
        } else {
            gameBoard.classList.add("solved_board_incorrect")
        }
    }
}

function handle_full_board() {
    for(let x = 0; x < ncols - 1; ++x)
        for(let y = 0; y < nrows - 1; ++y) {
            if(board[x][y].color === BLACK && board[x + 1][y].color === BLACK && board[x][y + 1].color === BLACK && board[x + 1][y + 1].color === BLACK) {
                board[x][y].mistake = true
                board[x + 1][y].mistake = true
                board[x][y + 1].mistake = true
                board[x + 1][y + 1].mistake = true
                return false
            }
        }

    let blacks = []
    for(let x = 0; x < ncols; ++x) {
        blacks[x] = []
        for (let y = 0; y < nrows; ++y) {
            blacks[x][y] = false
        }
    }
    let black_x = -1
    let black_y = -1
    for(let x = 0; x < ncols; ++x)
        for(let y = 0; y < nrows; ++y) {
            if(board[x][y].color === BLACK) {
                black_x = x
                black_y = y
                break
            }
        }
    
    if(black_x != -1) {
        black_spread_dfs(black_x, black_y, blacks)
        for(let x = 0; x < ncols; ++x)
            for(let y = 0; y < nrows; ++y) {
                if(board[x][y].color === BLACK && !blacks[x][y]) {
                    for(let xx = 0; xx < ncols; ++xx)
                        for(let yy = 0; yy < nrows; ++yy)
                            if(blacks[xx][yy])
                                board[xx][yy].mistake = true

                    return false
                }
            }
    }

    let whites = []
    for(let x = 0; x < ncols; ++x) {
        whites[x] = []
        for (let y = 0; y < nrows; ++y) {
            whites[x][y] = 0
        }
    }
    let white_index = 0

    for(let x = 0; x < ncols; ++x)
        for(let y = 0; y < nrows; ++y)
            if(board[x][y].color === WHITE && !whites[x][y]) {
                ++white_index
                let last_number = {x: -1, y: -1, num: -1}
                let area = white_spread_dfs(x, y, whites, white_index, last_number)
                if(area >= 0) {
                    if(last_number.num < 0) {
                        for(let xx = 0; xx < ncols; ++xx)
                            for(let yy = 0; yy < nrows; ++yy)
                                if(whites[xx][yy] === white_index)
                                    board[xx][yy].mistake = true
                        return false
                    } else if(last_number.num != area) {
                        board[last_number.x][last_number.y].mistake = true
                        return false
                    }
                } else {
                    return false
                }
            }

    return true
}

function black_spread_dfs(x, y, blacks) {
    blacks[x][y] = true
    if(x > 0 && board[x - 1][y].color === BLACK && !blacks[x - 1][y]) {
        black_spread_dfs(x - 1, y, blacks)
    }
    if(x < ncols - 1 && board[x + 1][y].color === BLACK && !blacks[x + 1][y]) {
        black_spread_dfs(x + 1, y, blacks)
    }
    if(y > 0 && board[x][y - 1].color === BLACK && !blacks[x][y - 1]) {
        black_spread_dfs(x, y - 1, blacks)
    }
    if(y < nrows - 1 && board[x][y + 1].color === BLACK && !blacks[x][y + 1]) {
        black_spread_dfs(x, y + 1, blacks)
    }
}

function white_spread_dfs(x, y, whites, white_index, last_number) {
    let area = 1
    whites[x][y] = white_index
    if(board[x][y].number > 0) {
        if(last_number.num > 0) {
            board[x][y].mistake = true
            board[last_number.x][last_number.y].mistake = true
            return -1
        } else {
            last_number.x = x
            last_number.y = y
            last_number.num = board[x][y].number
        }
    }

    if(x > 0 && board[x - 1][y].color === WHITE && whites[x - 1][y] < white_index) {
        const r = white_spread_dfs(x - 1, y, whites, white_index, last_number)
        if(r < 0) return -1
        area += r
    }
    if(x < ncols - 1 && board[x + 1][y].color === WHITE && whites[x + 1][y] < white_index) {
        const r = white_spread_dfs(x + 1, y, whites, white_index, last_number)
        if(r < 0) return -1
        area += r
    }
    if(y > 0 && board[x][y - 1].color === WHITE && whites[x][y - 1] < white_index) {
        const r = white_spread_dfs(x, y - 1, whites, white_index, last_number)
        if(r < 0) return -1
        area += r
    }
    if(y < nrows - 1 && board[x][y + 1].color === WHITE && whites[x][y + 1] < white_index) {
        const r = white_spread_dfs(x, y + 1, whites, white_index, last_number)
        if(r < 0) return -1
        area += r
    }

    return area
}

function render_board() {
    //gameBoard.innerHTML = "";
    while (gameBoard.firstChild) { gameBoard.removeChild(gameBoard.firstChild); }
    /*gameBoard.className = "board"*/
 
    for (let y = 0; y < nrows; ++y) {
        for (let x = 0; x < ncols; ++x) {
            const cell = document.createElement("div")
            cell.className = "cell"
            cell.id = "cell" + x + "_" + y
            if (board[x][y].color === WHITE) {
                cell.classList.add("white")                
            } else if(board[x][y].color === BLACK) {
                cell.classList.add("black")
            } else if(board[x][y].color === UNKN) {

            } else {
                alert("error")
            }
            if(board[x][y].mistake) {
                cell.classList.add("mistake")
            }
            if(g_mode === MODE_EDIT && x === edit_cell_x && y === edit_cell_y) {
                cell.classList.add("selected")
            }

            if (board[x][y].number > 0) {
                const ttt = document.createElement("p")
                ttt.className = "cell_text";
                ttt.textContent = board[x][y].number
                cell.appendChild(ttt)
            }
            cell.addEventListener("click", () => left_click_cell(x, y));
            cell.addEventListener("contextmenu", (event) => 
            {
                event.preventDefault();
                right_click_cell(x, y)
                return false
            });

            gameBoard.appendChild(cell);
        }
        gameBoard.appendChild(document.createElement("br"));
    }

    /*const canvas = document.getElementById("canvas")
    canvas.innerHTML = ""
    
    const newElement = document.createElement("div")
    newElement.className = "cell"
    newElement.classList.add("left_edit_button")
    newElement.textContent = "+"
    canvas.appendChild(newElement)

    canvas.appendChild(gameBoard)*/

    /*const newElement2 = document.createElement("div")
    newElement.className = "cell"
    newElement.textContent = "-"
    canvas.appendChild(newElement2);*/
}
 
function set_mode(mode) {
    if(mode === MODE_PLAY) {
        for (let y = 0; y < nrows - 1; ++y) {
            for (let x = 0; x < ncols; ++x) {
                if(board[x][y].number != 0 && board[x][y + 1].number != 0) {
                    board[x][y].mistake = true;
                    board[x][y + 1].mistake = true;
                    render_board()
                    return
                }
            }
        }
        for (let x = 0; x < ncols - 1; ++x) {
            for (let y = 0; y < nrows; ++y) {
                if(board[x][y].number != 0 && board[x + 1][y].number != 0) {
                    board[x][y].mistake = true;
                    board[x + 1][y].mistake = true;
                    render_board()
                    return
                }
            }
        }
    }

    g_mode = mode
    if(mode === MODE_EDIT) {
        const edit_button = document.getElementById("edit_mode_button")
        edit_button.classList.remove("inactive_mode_button")
        edit_button.classList.add("active_mode_button")
        const play_button = document.getElementById("play_mode_button")
        play_button.classList.remove("active_mode_button")
        play_button.classList.add("inactive_mode_button")

        const add_row_top_button = document.getElementById("add_row_top_button")
        add_row_top_button.classList.remove("hidden")
        const remove_row_top_button = document.getElementById("remove_row_top_button")
        remove_row_top_button.classList.remove("hidden")
        const add_row_bottom_button = document.getElementById("add_row_bottom_button")
        add_row_bottom_button.classList.remove("hidden")
        const remove_row_bottom_button = document.getElementById("remove_row_bottom_button")
        remove_row_bottom_button.classList.remove("hidden")
        const add_col_left_button = document.getElementById("add_col_left_button")
        add_col_left_button.classList.remove("hidden")
        const remove_col_left_button = document.getElementById("remove_col_left_button")
        remove_col_left_button.classList.remove("hidden")
        const add_col_right_button = document.getElementById("add_col_right_button")
        add_col_right_button.classList.remove("hidden")
        const remove_col_right_button = document.getElementById("remove_col_right_button")
        remove_col_right_button.classList.remove("hidden")

        document.addEventListener("keydown", keyboard_interceptor_in_edit_mode)
    } else if(mode === MODE_PLAY) {
        const edit_button = document.getElementById("edit_mode_button")
        edit_button.classList.remove("active_mode_button")
        edit_button.classList.add("inactive_mode_button")
        const play_button = document.getElementById("play_mode_button")
        play_button.classList.remove("inactive_mode_button")
        play_button.classList.add("active_mode_button")

        const add_row_top_button = document.getElementById("add_row_top_button")
        add_row_top_button.classList.add("hidden")
        const remove_row_top_button = document.getElementById("remove_row_top_button")
        remove_row_top_button.classList.add("hidden")
        const add_row_bottom_button = document.getElementById("add_row_bottom_button")
        add_row_bottom_button.classList.add("hidden")
        const remove_row_bottom_button = document.getElementById("remove_row_bottom_button")
        remove_row_bottom_button.classList.add("hidden")
        const add_col_left_button = document.getElementById("add_col_left_button")
        add_col_left_button.classList.add("hidden")
        const remove_col_left_button = document.getElementById("remove_col_left_button")
        remove_col_left_button.classList.add("hidden")
        const add_col_right_button = document.getElementById("add_col_right_button")
        add_col_right_button.classList.add("hidden")
        const remove_col_right_button = document.getElementById("remove_col_right_button")
        remove_col_right_button.classList.add("hidden")

        document.removeEventListener("keydown", keyboard_interceptor_in_edit_mode)
    } else {
        alert("errr")
    }

    handle_board_after_change();
    render_board();
}

function keyboard_interceptor_in_edit_mode(event) {
    if(event.key >= "0" && event.key <= "9") {
        const integer = Number(event.key)
        if(edit_cell_x < 0 || edit_cell_x >= ncols || edit_cell_y < 0 || edit_cell_y >= nrows) {
            alert("err2")
        }
        const old_number = board[edit_cell_x][edit_cell_y].number
        if(old_number < 0 || old_number >= 1000) {
            alert("err4")
        }
        board[edit_cell_x][edit_cell_y].number = old_number * 10 + integer
        if(board[edit_cell_x][edit_cell_y].number >= 1000) {
            board[edit_cell_x][edit_cell_y].number = integer
        }

        if(board[edit_cell_x][edit_cell_y].number > 0) {
            board[edit_cell_x][edit_cell_y].color = WHITE
        } else {
            board[edit_cell_x][edit_cell_y].color = UNKN
        }
        handle_board_after_change()
        render_board();
    } else if(event.key === "Delete") {
        if(board[edit_cell_x][edit_cell_y].number > 0) {
            board[edit_cell_x][edit_cell_y].number = 0
            board[edit_cell_x][edit_cell_y].color = UNKN

            handle_board_after_change()
            render_board();
        }
    } else if(event.key === "Backspace") {
        if(board[edit_cell_x][edit_cell_y].number > 0) {
            const old_number = board[edit_cell_x][edit_cell_y].number
            board[edit_cell_x][edit_cell_y].number = Math.floor(old_number / 10)
            if(board[edit_cell_x][edit_cell_y].number === 0) {
                board[edit_cell_x][edit_cell_y].color = UNKN
            }

            handle_board_after_change()
            render_board();
        }
    } else if(event.key === "ArrowLeft") {
        if(edit_cell_x > 0) {
            edit_cell_x -= 1;
            handle_board_after_change()
            render_board();
        }
    } else if(event.key === "ArrowRight") {
        if(edit_cell_x < ncols - 1) {
            edit_cell_x += 1;
            handle_board_after_change()
            render_board();
        }
    } else if(event.key === "ArrowUp") {
        if(edit_cell_y > 0) {
            edit_cell_y -= 1;
            handle_board_after_change()
            render_board();
        }
    } else if(event.key === "ArrowDown") {
        if(edit_cell_y < nrows - 1) {
            edit_cell_y += 1;
            handle_board_after_change()
            render_board();
        }
    }
}

function add_row_top() {
    for(let x = 0; x < ncols; ++x) {
        /*for(let y = nrows; y > 0; --y)
            board[x][y] = board[x][y - 1];
        board[x][0] = {number: 0, color: UNKN, mistake: false}*/
        board[x].unshift({number: 0, color: UNKN, mistake: false})
    }
    nrows += 1
    edit_cell_y += 1
    handle_board_after_change()
    render_board()
}

function remove_row_top() {
    if(nrows > MIN_NROWS) {
        for(let x = 0; x < ncols; ++x) {
            /*for(let y = 0; y < nrows; ++y)
                board[x][y] = board[x][y + 1];
            board[x][nrows] = {number: 0, color: UNKN, mistake: false}*/
            board[x].shift()
        }
        nrows -= 1
        if(edit_cell_y > 0) edit_cell_y -= 1
        handle_board_after_change()
        render_board()
    }
}

function add_row_bottom() {
    for(let x = 0; x < ncols; ++x) {
        board[x][nrows] = {number: 0, color: UNKN, mistake: false}
    }
    nrows += 1
    handle_board_after_change()
    render_board()
}

function remove_row_bottom() {
    if(nrows > MIN_NROWS) {
        for(let x = 0; x < ncols; ++x) {
            board[x].pop()
        }
        if(edit_cell_y === nrows - 1) edit_cell_y -= 1
        nrows -= 1        
        handle_board_after_change()
        render_board()
    }
}

function add_col_left() {
    board.unshift([])
    for(let y = 0; y < nrows; ++y) {
        board[0][y] = {number: 0, color: UNKN, mistake: false}
    }
    ncols += 1
    edit_cell_x += 1
    handle_board_after_change()
    render_board()
}

function remove_col_left() {
    if(ncols > MIN_NCOLS) {
        board.shift()
        ncols -= 1
        if(edit_cell_x > 0) edit_cell_x -= 1
        handle_board_after_change()
        render_board()
    }
}

function add_col_right() {
    board.push([])
    for(let y = 0; y < nrows; ++y) {
        board[ncols][y] = {number: 0, color: UNKN, mistake: false}
    }
    ncols += 1
    handle_board_after_change()
    render_board()
}

function remove_col_right() {
    if(ncols > MIN_NCOLS) {
        board.pop()
        if(edit_cell_x === ncols - 1) edit_cell_x -= 1
        ncols -= 1
        handle_board_after_change()
        render_board()
    }
}

function serialize_board() {
    let string = ""
    string += nrows + '\n'
    string += ncols + '\n'
    for(let y = 0; y < nrows; ++y) {
        for(let x = 0; x < ncols; ++x)
            string += board[x][y].number + ' '
        string += '\n'
    }
    for(let y = 0; y < nrows; ++y) {
        for(let x = 0; x < ncols; ++x)
            string += board[x][y].color
        string += '\n'
    }

    //alert(string)

    return string
}

function apply_string_returned_by_solver(s) {
    const parts = s.split('\n')  // last part is '\0' from C++
    //alert(parts.length)
    const returned = Number(parts[0])
    if(returned === 0) {
        alert("incorrect data")
    } else {
        for(let h = 0; h < parts.length - 2; ++h) {
            const t = parts[h + 1].split(' ')
            if(t.length != 6) {
                alert("Parse error")
            }
            const x = Number(t[1])
            const y = Number(t[2])
            const solver_prev = Number(t[3])
            if(solver_prev != SOLVER_UNKN) {
                alert("Parse error2")
            }
            const solver_next = Number(t[4])
            let next
            if(solver_next === SOLVER_BLACK) {
                next = BLACK
            } else if(solver_next >= SOLVER_WHITE) {
                next = WHITE
            } else {
                alert("err6")
            }
            const reason = t[5]

            console.log(h)
            action_set_color(x, y, next, reason)
        }

        handle_board_after_change()
        render_board()
    }
}

// running code

initialize_board();
set_mode(MODE_EDIT);
// handle_board_after_change();
// render_board();



/*Module['onRuntimeInitialized'] = onRuntimeInitialized;
function onRuntimeInitialized() {
    const helloMessage = Module.cwrap('getHelloMessage', 'string', ['string'])('abcde');
    const element = document.getElementById('output');
    //element.textContent = helloMessage;
}
getHelloMessage = Module.cwrap('getHelloMessage', 'string', ['string'])

const element = document.getElementById('output');
//const str = serialize_board()
element.textContent = Module.cwrap('getHelloMessage', 'string', ['string'])("str");*/


/*
import { Module } from "./a.out.js"
getHelloMessage = Module.cwrap('getHelloMessage', 'string', ['string'])

alert(getHelloMessage('asdasda'))*/
//serialize_board()
