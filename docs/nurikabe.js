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
const ACTION_ADD_ROW = 'r'  // in y store before which row to insert (0 .. nrows)
const ACTION_REMOVE_ROW = 'q'  // in y store which row to remove (0 .. nrows-1), in prev store [{color, number}]
const ACTION_ADD_COL = 'a'  // in x store before which col to insert (0 .. ncols)
const ACTION_REMOVE_COL = 'd'  // in x store which col to remove (0 .. ncols-1), in prev store [{color, number}]

const REASON_USER = '0'

let history = []  // [h] = {x, y, prev, next, type, reason}
let cur_history = 0  // applied 0 .. (cur_history-1) actions

let edit_cell_x = 0
let edit_cell_y = 0
 
const gameBoard = document.getElementById("gameBoard")
let board = []  // [x][y] = {number, color, mistake}

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
            let new_number = board[x][y].number + 1
            if(new_number === 1000) {
                new_number = 0
            }

            if(board[x][y].color != WHITE) {
                action_set_color(x, y, WHITE, REASON_USER)
            }
            action_set_number(x, y, new_number)
            if(new_number === 0) {
                action_set_color(x, y, UNKN, REASON_USER)
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
            let new_number = board[x][y].number - 1
            if(new_number === -1) {
                new_number = 999
            }

            if(board[x][y].color != WHITE) {
                action_set_color(x, y, WHITE, REASON_USER)
            }
            action_set_number(x, y, new_number)
            if(new_number === 0) {
                action_set_color(x, y, UNKN, REASON_USER)
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
    if(cur_history < history.length) {
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
        } else if(h.type === ACTION_ADD_ROW) {
            if(h.y === 0) {
                for(let x = 0; x < ncols; ++x) {
                    board[x].unshift({number: 0, color: UNKN, mistake: false})
                }
                edit_cell_y += 1
            } else if(h.y === nrows) {
                for(let x = 0; x < ncols; ++x) {
                    board[x][nrows] = {number: 0, color: UNKN, mistake: false}
                }
            } else {
                alert("error_row_add")
            }

            nrows += 1
        } else if(h.type === ACTION_REMOVE_ROW) {
            if(nrows <= MIN_NROWS) {
                alert("error4")
            }
            for(let x = 0; x < ncols; ++x) {
                if(board[x][h.y].color != h.prev[x].color) {
                    alert("error5")
                }
                if(board[x][h.y].number != h.prev[x].number) {
                    alert("error6")
                }
            }

            if(h.y === 0) {
                for(let x = 0; x < ncols; ++x) {
                    board[x].shift()
                }
                if(edit_cell_y > 0) edit_cell_y -= 1
            } else if(h.y === nrows - 1) {
                for(let x = 0; x < ncols; ++x) {
                    board[x].pop()
                }
                if(edit_cell_y === nrows - 1) edit_cell_y -= 1
            } else {
                alert("error_row_remove")
            }
            nrows -= 1
        } else if(h.type === ACTION_ADD_COL) {
            if(h.x === 0) {
                board.unshift([])
                for(let y = 0; y < nrows; ++y) {
                    board[0][y] = {number: 0, color: UNKN, mistake: false}
                }
                edit_cell_x += 1
            } else if(h.x === ncols) {
                board.push([])
                for(let y = 0; y < nrows; ++y) {
                    board[ncols][y] = {number: 0, color: UNKN, mistake: false}
                }
            } else {
                alert("error_col_add")
            }

            ncols += 1
        } else if(h.type === ACTION_REMOVE_COL) {
            if(ncols <= MIN_NCOLS) {
                alert("error5")
            }
            for(let y = 0; y < nrows; ++y) {
                if(board[h.x][y].color != h.prev[y].color) {
                    alert("error7")
                }
                if(board[h.x][y].number != h.prev[y].number) {
                    alert("error8")
                }
            }

            if(h.x === 0) {
                board.shift()
                if(edit_cell_x > 0) edit_cell_x -= 1
            } else if(h.x === ncols - 1) {
                board.pop()
                if(edit_cell_x === ncols - 1) edit_cell_x -= 1
            } else {
                alert("error_col_remove")
            }

            ncols -= 1
        } else {
            alert("history error " + h.type)
        }

        cur_history += 1
    } else {  // cur_history >= history.length
        // tried to apply action which is not yet recorded, do nothing?
    }
    //console.log("hist_for", cur_history, history.length)
}

function history_backward() {
    if(cur_history > 0) {
        cur_history -= 1
        const h = history[cur_history]

        if(h.type === ACTION_COLOR) {
            if(board[h.x][h.y].color != h.next) {
                alert("error1")
            }
            board[h.x][h.y].color = h.prev
        } else if (h.type === ACTION_NUMBER) {
            if(board[h.x][h.y].number != h.next) {
                alert("error2")
            }
            board[h.x][h.y].number = h.prev
        } else if(h.type === ACTION_ADD_ROW) {
            if(nrows <= MIN_NROWS + 1) {
                alert("error4")
            }
            for(let x = 0; x < ncols; ++x) {
                if(board[x][h.y].color != UNKN) {
                    alert("error5")
                }
                if(board[x][h.y].number != 0) {
                    alert("error6")
                }
            }

            if(h.y === 0) {
                for(let x = 0; x < ncols; ++x) {
                    board[x].shift()
                }
                if(edit_cell_y > 0) edit_cell_y -= 1
            } else if(h.y === nrows - 1) {
                for(let x = 0; x < ncols; ++x) {
                    board[x].pop()
                }
                if(edit_cell_y === nrows - 1) edit_cell_y -= 1
            } else {
                alert("error_row_remove")
            }
            nrows -= 1
        } else if(h.type === ACTION_REMOVE_ROW) {
            if(h.y === 0) {
                for(let x = 0; x < ncols; ++x) {
                    board[x].unshift({number: h.prev[x].number, color: h.prev[x].color, mistake: false})
                }
                edit_cell_y += 1
            } else if(h.y === nrows) {
                for(let x = 0; x < ncols; ++x) {
                    board[x][nrows] = {number: h.prev[x].number, color: h.prev[x].color, mistake: false}
                }
            } else {
                alert("error_row_add")
            }

            nrows += 1
        } else if(h.type === ACTION_ADD_COL) {
            if(ncols <= MIN_NCOLS + 1) {
                alert("error5")
            }
            for(let y = 0; y < nrows; ++y) {
                if(board[h.x][y].color != UNKN) {
                    alert("error7")
                }
                if(board[h.x][y].number != 0) {
                    alert("error8")
                }
            }

            if(h.x === 0) {
                board.shift()
                if(edit_cell_x > 0) edit_cell_x -= 1
            } else if(h.x === ncols - 1) {
                board.pop()
                if(edit_cell_x === ncols - 1) edit_cell_x -= 1
            } else {
                alert("error_col_remove")
            }

            ncols -= 1
        } else if(h.type === ACTION_REMOVE_COL) {
            if(h.x === 0) {
                board.unshift([])
                for(let y = 0; y < nrows; ++y) {
                    board[0][y] = {number: h.prev[y].number, color: h.prev[y].color, mistake: false}
                }
                edit_cell_x += 1
            } else if(h.x === ncols) {
                board.push([])
                for(let y = 0; y < nrows; ++y) {
                    board[ncols][y] = {number: h.prev[y].number, color: h.prev[y].color, mistake: false}
                }
            } else {
                alert("error_col_add")
            }

            ncols += 1
        } else {
            alert("history error " + h.type)
        }
    } else {  // cur_history <= 0
        if(cur_history < 0) {
            alert("hist_cur_back error")
        }
        // cur_history == 0
        // tried to unwind action before 0th, do nothing?
    }
    //console.log("hist_back", cur_history, history.length)
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
                    return false
                }
            }
        }
        for (let x = 0; x < ncols - 1; ++x) {
            for (let y = 0; y < nrows; ++y) {
                if(board[x][y].number != 0 && board[x + 1][y].number != 0) {
                    board[x][y].mistake = true;
                    board[x + 1][y].mistake = true;
                    render_board()
                    return false
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

    return true
}

function keyboard_interceptor_in_edit_mode(event) {
    if(document.activeElement.id != "input_janko" && document.activeElement.id != "input_puzzlink") {  // exclude input elements
        if(event.key >= "0" && event.key <= "9") {
            const integer = Number(event.key)
            if(edit_cell_x < 0 || edit_cell_x >= ncols || edit_cell_y < 0 || edit_cell_y >= nrows) {
                alert("err2")
            }
            const old_number = board[edit_cell_x][edit_cell_y].number
            if(old_number < 0 || old_number >= 1000) {
                alert("err4")
            }

            let new_number = old_number * 10 + integer
            if(new_number >= 1000) {
                new_number = integer
            }

            if(board[edit_cell_x][edit_cell_y].color != WHITE && new_number != 0) {
                action_set_color(edit_cell_x, edit_cell_y, WHITE, REASON_USER)
            }
            if(new_number != old_number) {
                action_set_number(edit_cell_x, edit_cell_y, new_number)
            }
            if(new_number === 0 && board[edit_cell_x][edit_cell_y].color != UNKN) {
                action_set_color(edit_cell_x, edit_cell_y, UNKN, REASON_USER)
            }

            handle_board_after_change()
            render_board();
        } else if(event.key === "Delete") {
            if(board[edit_cell_x][edit_cell_y].number > 0) {
                action_set_number(edit_cell_x, edit_cell_y, 0)
                action_set_color(edit_cell_x, edit_cell_y, UNKN, REASON_USER)

                handle_board_after_change()
                render_board();
            }
        } else if(event.key === "Backspace") {
            if(board[edit_cell_x][edit_cell_y].number > 0) {
                const old_number = board[edit_cell_x][edit_cell_y].number
                const new_number = Math.floor(old_number / 10)
                action_set_number(edit_cell_x, edit_cell_y, new_number)
                if(new_number == 0) {
                    action_set_color(edit_cell_x, edit_cell_y, UNKN, REASON_USER)
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
}

function add_row_top() {
    history[cur_history] = {y: 0, type: ACTION_ADD_ROW, reason: REASON_USER}
    if(cur_history >= history.length) {
        alert("error_len")
    }
    
    history_forward()  // increments cur_history
    
    while(cur_history < history.length) {
        history.pop()
    }

    handle_board_after_change()
    render_board()
}

function remove_row_top() {
    if(nrows > MIN_NROWS) {
        history[cur_history] = {y: 0, type: ACTION_REMOVE_ROW, reason: REASON_USER, prev: []}
        for(let x = 0; x < ncols; ++x)
            history[cur_history].prev[x] = {color: board[x][0].color, number: board[x][0].number}
        if(cur_history >= history.length) {
            alert("error_len")
        }
        
        history_forward()  // increments cur_history
        
        while(cur_history < history.length) {
            history.pop()
        }

        handle_board_after_change()
        render_board()
    }
}

function add_row_bottom() {
    history[cur_history] = {y: nrows, type: ACTION_ADD_ROW, reason: REASON_USER}
    if(cur_history >= history.length) {
        alert("error_len")
    }
    
    history_forward()  // increments cur_history
    
    while(cur_history < history.length) {
        history.pop()
    }

    handle_board_after_change()
    render_board()
}

function remove_row_bottom() {
    if(nrows > MIN_NROWS) {
        history[cur_history] = {y: nrows - 1, type: ACTION_REMOVE_ROW, reason: REASON_USER, prev: []}
        for(let x = 0; x < ncols; ++x)
            history[cur_history].prev[x] = {color: board[x][nrows - 1].color, number: board[x][nrows - 1].number}
        if(cur_history >= history.length) {
            alert("error_len")
        }
        
        history_forward()  // increments cur_history
        
        while(cur_history < history.length) {
            history.pop()
        }

        handle_board_after_change()
        render_board()
    }
}

function add_col_left() {
    history[cur_history] = {x: 0, type: ACTION_ADD_COL, reason: REASON_USER}
    if(cur_history >= history.length) {
        alert("error_len")
    }
    
    history_forward()  // increments cur_history
    
    while(cur_history < history.length) {
        history.pop()
    }

    handle_board_after_change()
    render_board()
}

function remove_col_left() {
    if(ncols > MIN_NCOLS) {
        history[cur_history] = {x: 0, type: ACTION_REMOVE_COL, reason: REASON_USER, prev: []}
        for(let y = 0; y < nrows; ++y)
            history[cur_history].prev[y] = {color: board[0][y].color, number: board[0][y].number}
        if(cur_history >= history.length) {
            alert("error_len")
        }
        
        history_forward()  // increments cur_history
        
        while(cur_history < history.length) {
            history.pop()
        }

        handle_board_after_change()
        render_board()
    }
}

function add_col_right() {
    history[cur_history] = {x: ncols, type: ACTION_ADD_COL, reason: REASON_USER}
    if(cur_history >= history.length) {
        alert("error_len")
    }
    
    history_forward()  // increments cur_history
    
    while(cur_history < history.length) {
        history.pop()
    }

    handle_board_after_change()
    render_board()
}

function remove_col_right() {
    if(ncols > MIN_NCOLS) {
        history[cur_history] = {x: ncols - 1, type: ACTION_REMOVE_COL, reason: REASON_USER, prev: []}
        for(let y = 0; y < nrows; ++y)
            history[cur_history].prev[y] = {color: board[ncols - 1][y].color, number: board[ncols - 1][y].number}
        if(cur_history >= history.length) {
            alert("error_len")
        }
        
        history_forward()  // increments cur_history
        
        while(cur_history < history.length) {
            history.pop()
        }

        handle_board_after_change()
        render_board()
    }
}

function set_puzzle_very_easy() {
    ncols = 3
    nrows = 3
    history = []
    cur_history = 0
    edit_cell_x = 0
    edit_cell_y = 0
    
    for (let x = 0; x < ncols; ++x) {
        board[x] = []
        for (let y = 0; y < nrows; ++y) {
            board[x][y] = {number: 0, color: UNKN, mistake: false}
        }
    }

    board[0][0].number = 3
    board[2][0].number = 2
 
    for (let x = 0; x < ncols; ++x) {
        for (let y = 0; y < nrows; ++y) {
            if(board[x][y].number > 0) {
                board[x][y].color = WHITE
            }
        }
    }

    set_mode(MODE_PLAY)
}

function set_puzzle_easy() {
    ncols = 5
    nrows = 5
    history = []
    cur_history = 0
    edit_cell_x = 0
    edit_cell_y = 0

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

    set_mode(MODE_PLAY)
}

function set_puzzle_medium() {
    ncols = 8
    nrows = 8
    history = []
    cur_history = 0
    edit_cell_x = 0
    edit_cell_y = 0

    for (let x = 0; x < ncols; ++x) {
        board[x] = []
        for (let y = 0; y < nrows; ++y) {
            board[x][y] = {number: 0, color: UNKN, mistake: false}
        }
    }

    board[0][0].number = 7
    board[6][0].number = 4
    board[0][3].number = 4
    board[2][4].number = 3
    board[0][5].number = 4
    board[7][5].number = 3
    board[3][7].number = 3
    board[6][7].number = 4
 
    for (let x = 0; x < ncols; ++x) {
        for (let y = 0; y < nrows; ++y) {
            if(board[x][y].number > 0) {
                board[x][y].color = WHITE
            }
        }
    }

    set_mode(MODE_PLAY)
}

function clear_colors() {
    for (let x = 0; x < ncols; ++x) {
        for (let y = 0; y < nrows; ++y) {
            if(board[x][y].number === 0 && board[x][y].color != UNKN) action_set_color(x, y, UNKN, REASON_USER)
        }
    }
    handle_board_after_change()
    render_board();
}

function clear_field() {
    for (let x = 0; x < ncols; ++x) {
        for (let y = 0; y < nrows; ++y) {
            if(board[x][y].number > 0) action_set_number(x, y, 0)
            if(board[x][y].color != UNKN) action_set_color(x, y, UNKN, REASON_USER)
        }
    }
    handle_board_after_change()
    render_board();
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

    const max_depth_selector = document.getElementById("max-depth")
    const max_depth = max_depth_selector.options[max_depth_selector.selectedIndex].value;

    string += max_depth + '\n'

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

            console.log(parts[h+1])
            action_set_color(x, y, next, reason)
        }

        handle_board_after_change()
        render_board()
    }
}

function get_puzzlink() {
    let string = "https://puzz.link/p?nurikabe/"
    string += ncols
    string += "/"
    string += nrows
    string += "/"
    let nempty = 0
    for(let y = 0; y < nrows; ++y) {
        for(let x = 0; x < ncols; ++x) {
            if(board[x][y].number === 0) {
                nempty += 1
            } else {
                while(nempty >= 20) {
                    string += "z"
                    nempty -= 20
                }
                if(nempty > 0) {
                    string += String.fromCharCode(102 + nempty)  // 'f'+
                    nempty = 0
                }
                if(board[x][y].number < 16) {
                    string += single_digit_to_hex(board[x][y].number)
                } else if(board[x][y].number <= 255) {
                    const first_digit = board[x][y].number / 16
                    const last_digit = board[x][y].number % 16
                    string += "-" + single_digit_to_hex(first_digit) + single_digit_to_hex(last_digit)
                } else {
                    const first_digit = board[x][y].number / 256
                    const middle_digit = (board[x][y].number / 16) % 16
                    const last_digit = board[x][y].number % 16
                    string += "+" + single_digit_to_hex(first_digit) + single_digit_to_hex(middle_digit) + single_digit_to_hex(last_digit)
                }
            }
        }
    }

    while(nempty >= 20) {
        string += "z"
        nempty -= 20
    }
    if(nempty > 0) {
        string += String.fromCharCode(102 + nempty)  // 'f'+
    }

    return string
}

function single_digit_to_hex (n) {
    if(n < 0 || n >= 16) {
        alert("hex digit error")
    }
    if(n < 10) {
        return String.fromCharCode(48 + n)  // '0'+
    } else {
        return String.fromCharCode(87 + n)  // 'a'-10+
    }
}

function input_puzzlink_click() {
    const copy_text = document.getElementById("input_puzzlink")
    copy_text.select()
    copy_text.setSelectionRange(0, 99999)
    import_from_puzzlink(copy_text.value)
}

function import_from_puzzlink (s) {
    const start = s.slice(0, 29)
    if(start != "https://puzz.link/p?nurikabe/") {
        alert("start mismatch")
        return false
    }
    const end = s.slice(29)
    const parts = end.split('/')
    if(parts.length != 3) {
        alert("link must contain 3 parts after first 29 characters, but it contains " + parts.length)
        return false
    }
    const link_ncols = Number(parts[0])
    if(link_ncols < MIN_NCOLS) {
        alert("too low ncols")
        return false
    }
    const link_nrows = Number(parts[1])
    if(link_nrows < MIN_NROWS) {
        alert("too low nrows")
        return false
    }
    const field_str = parts[2]
    let cells_count = 0
    for(let i = 0; i < field_str.length; i += 1) {
        if(field_str[i] >= '0' && field_str[i] <= '9') {
            cells_count += 1
        } else if(field_str[i] >= 'a' && field_str[i] <= 'f') {
            cells_count += 1
        } else if(field_str[i] >= 'g' && field_str[i] <= 'z') {
            cells_count += field_str.charCodeAt(i) - 102  // 'f' = 102
        } else if(field_str[i] == '-') {
            if(i + 2 >= field_str.length) {
                alert("There must be at least 2 characters after '-'")
                return false
            }
            if(!(field_str[i + 1] >= 'a' && field_str[i + 1] <= 'f') && !((field_str[i + 1] >= '0' && field_str[i + 1] <= '9'))) {
                alert("first character after '-' must be hex but it is " + field_str[i + 1])
                return false
            }
            if(!(field_str[i + 2] >= 'a' && field_str[i + 2] <= 'f') && !((field_str[i + 2] >= '0' && field_str[i + 2] <= '9'))) {
                alert("first character after '-' must be hex but it is " + field_str[i + 2])
                return false
            }
            cells_count += 1
            i += 2
        } else if(field_str[i] == '+') {
            if(i + 3 >= field_str.length) {
                alert("There must be at least 3 characters after '+'")
                return false
            }
            if(!(field_str[i + 1] >= 'a' && field_str[i + 1] <= 'f') && !((field_str[i + 1] >= '0' && field_str[i + 1] <= '9'))) {
                alert("first character after '+' must be hex but it is " + field_str[i + 1])
                return false
            }
            if(!(field_str[i + 2] >= 'a' && field_str[i + 2] <= 'f') && !((field_str[i + 2] >= '0' && field_str[i + 2] <= '9'))) {
                alert("first character after '+' must be hex but it is " + field_str[i + 2])
                return false
            }
            if(!(field_str[i + 3] >= 'a' && field_str[i + 3] <= 'f') && !((field_str[i + 3] >= '0' && field_str[i + 3] <= '9'))) {
                alert("first character after '+' must be hex but it is " + field_str[i + 3])
                return false
            }
            cells_count += 1
            i += 3
        } else if(field_str[i] == '.') {
            alert("nurikabe variant with '?' cells is not supported")
            return false
        } else {
            alert("unrecognized symbol in link: " + field_str[i])
            return false
        }
    }

    if(cells_count != link_ncols * link_nrows) {
        alert("number of cells mismatch in link: " + parts[0] + '*' + parts[1] + "!=" + String(cells_count))
        return false
    }

    ncols = link_ncols
    nrows = link_nrows
    history = []
    cur_history = 0
    edit_cell_x = 0
    edit_cell_y = 0

    for (let x = 0; x < ncols; ++x) {
        board[x] = []
        for (let y = 0; y < nrows; ++y) {
            board[x][y] = {number: 0, color: UNKN, mistake: false}
        }
    }

    cells_count = 0
    for(let i = 0; i < field_str.length; i += 1) {
        if(field_str[i] >= '0' && field_str[i] <= '9') {
            board[cells_count % ncols][Math.floor(cells_count / ncols)].number = field_str.charCodeAt(i) - 48  // '0' = 48
            cells_count += 1
        } else if(field_str[i] >= 'a' && field_str[i] <= 'f') {
            board[cells_count % ncols][Math.floor(cells_count / ncols)].number = field_str.charCodeAt(i) - 87  // 'a' - 10 = 87
            cells_count += 1
        } else if(field_str[i] >= 'g' && field_str[i] <= 'z') {
            cells_count += field_str.charCodeAt(i) - 102  // 'f' = 102
        } else if(field_str[i] == '-') {
            let number = 0
            if(field_str[i + 1] >= '0' && field_str[i + 1] <= '9') {
                number += 16 * (field_str.charCodeAt(i + 1) - 48)  // '0' = 48
            } else {
                number += 16 * (field_str.charCodeAt(i + 1) - 87)  // 'a' - 10 = 87
            }
            if(field_str[i + 2] >= '0' && field_str[i + 2] <= '9') {
                number += field_str.charCodeAt(i + 2) - 48  // '0' = 48
            } else {
                number += field_str.charCodeAt(i + 2) - 87  // 'a' - 10 = 87
            }
            board[cells_count % ncols][Math.floor(cells_count / ncols)].number = number
            cells_count += 1
            i += 2
        } else if(field_str[i] == '+') {
            let number = 0
            if(field_str[i + 1] >= '0' && field_str[i + 1] <= '9') {
                number += 256 * (field_str.charCodeAt(i + 1) - 48)  // '0' = 48
            } else {
                number += 256 * (field_str.charCodeAt(i + 1) - 87)  // 'a' - 10 = 87
            }
            if(field_str[i + 2] >= '0' && field_str[i + 2] <= '9') {
                number += 16 * (field_str.charCodeAt(i + 2) - 48)  // '0' = 48
            } else {
                number += 16 * (field_str.charCodeAt(i + 2) - 87)  // 'a' - 10 = 87
            }
            if(field_str[i + 3] >= '0' && field_str[i + 3] <= '9') {
                number += field_str.charCodeAt(i + 3) - 48  // '0' = 48
            } else {
                number += field_str.charCodeAt(i + 3) - 87  // 'a' - 10 = 87
            }
            board[cells_count % ncols][Math.floor(cells_count / ncols)].number = number
            cells_count += 1
            i += 3
        }
    }

    for (let x = 0; x < ncols; ++x) {
        for (let y = 0; y < nrows; ++y) {
            if(board[x][y].number > 0) {
                board[x][y].color = WHITE
            }
        }
    }

    const r = set_mode(MODE_PLAY)
    if(!r) {  // 2 neighboring numbered cells are supported by puzzlink for some reason
        set_mode(MODE_EDIT)
    }

    return true
}

function load_janko_click() {
    const copy_text = document.getElementById("input_janko")
    copy_text.select()
    let janko_index_str = copy_text.value
    const janko_index_number = Number(janko_index_str)
    if(janko_index_number <= 0 || janko_index_number > 9999) {
        alert("puzzle index must be >= 1 and <= 9999")
        return false
    }
    if(janko_index_str.length > 4) {
        alert("puzzle index can not contain more than 4 characters")
        return false
    }
    while(janko_index_str.length < 4) {
        janko_index_str = '0' + janko_index_str
    }

    //const janko_url = "https://www.janko.at/Raetsel/Nurikabe/" + janko_index_str + ".a.htm"  // CORS - blocked, not usable without proxy
    const janko_url = "https://raw.githubusercontent.com/miklla/LinearNurikabeSolverInternet/main/janko/" + janko_index_number + ".janko"  // had to replace with raws of files on github

    const xhr = new XMLHttpRequest();
    xhr.open("GET", janko_url, true);

    xhr.timeout = 2000; // time in milliseconds

    xhr.onload = function() {
        if(xhr.status != 200) {
            alert("Request failed with status " + xhr.status)
            return false
        }
        const parts = this.responseText.split('\n');
        let p = 0
        for(; p < parts.length; ++p) {
            const slice4 = parts[p].slice(0, 4)
            if(slice4 == "rows") {
                nrows = Number(parts[p].slice(5))
            } else if(slice4 == "cols") {
                ncols = Number(parts[p].slice(5))
            } else if(slice4 == "size") {
                nrows = Number(parts[p].slice(5))
                ncols = nrows
            } else if(parts[p].slice(0, 7) == "problem" || parts[p].slice(0, 9) == "[problem]") {
                break
            }
        }
        
        history = []
        cur_history = 0
        edit_cell_x = 0
        edit_cell_y = 0

        for (let x = 0; x < ncols; ++x) {
            board[x] = []
            for (let y = 0; y < nrows; ++y) {
                board[x][y] = {number: 0, color: UNKN, mistake: false}
            }
        }

        p += 1
        for(let y = 0; y < nrows; ++y) {
            const rrr = parts[p + y].split(' ')
            for(let x = 0; x < ncols; ++x) {
                if(rrr[x] != '-') {
                    board[x][y].number = Number(rrr[x])
                }
            }
        }

        for (let x = 0; x < ncols; ++x) {
            for (let y = 0; y < nrows; ++y) {
                if(board[x][y].number > 0) {
                    board[x][y].color = WHITE
                }
            }
        }
    
        const r = set_mode(MODE_PLAY)
    }
      
    xhr.onerror = function() {
        alert( 'Error ' + this.status );
    }
      
    xhr.send(null);
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

//[].forEach.call(document.querySelectorAll("*"),function(a){a.style.outline="1px solid #"+(~~(Math.random()*(1<<24))).toString(16)})  // debug all elements
