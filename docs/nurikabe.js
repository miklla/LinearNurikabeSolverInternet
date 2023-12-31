let nrows = 5
let ncols = 5
const WHITE = 'w'
const BLACK = 'b'
const UNKN = 'u'
let last_click_color = BLACK
let last_click_x = -1
let last_click_y = -1
let nlast_not_unkn_colors = 0
 
const gameBoard = document.getElementById("gameBoard")
let board = []
 
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
 
function click_cell(x, y) {
    if (x < 0 || x >= ncols || y < 0 || y >= nrows) {
        alert("er2")
        return
    }

    if(board[x][y].number > 0) {
        return
    }

    const old_color = board[x][y].color
    if(old_color === UNKN) {
        board[x][y].color = last_click_color
        nlast_not_unkn_colors = 1
    } else if(old_color === WHITE) {
        if(last_click_x != x || last_click_y != y || nlast_not_unkn_colors != 2) {
            board[x][y].color = BLACK
            last_click_color = BLACK
            nlast_not_unkn_colors = 2
        } else {
            board[x][y].color = UNKN
            last_click_color = BLACK
            nlast_not_unkn_colors = 0
        }
    } else if(old_color === BLACK) {
        if(last_click_x != x || last_click_y != y || nlast_not_unkn_colors != 2) {
            board[x][y].color = WHITE
            last_click_color = WHITE
            nlast_not_unkn_colors = 2
        } else {
            board[x][y].color = UNKN
            last_click_color = WHITE
            nlast_not_unkn_colors = 0
        }
    } else {
        alert(error)
    }

    last_click_x = x;
    last_click_y = y;

    handle_board_after_change()
    render_board();
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
                                if(whites[xx][yy] == white_index)
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

    if(x > 0 && board[x - 1][y].color == WHITE && whites[x - 1][y] < white_index) {
        const r = white_spread_dfs(x - 1, y, whites, white_index, last_number)
        if(r < 0) return -1
        area += r
    }
    if(x < ncols - 1 && board[x + 1][y].color == WHITE && whites[x + 1][y] < white_index) {
        const r = white_spread_dfs(x + 1, y, whites, white_index, last_number)
        if(r < 0) return -1
        area += r
    }
    if(y > 0 && board[x][y - 1].color == WHITE && whites[x][y - 1] < white_index) {
        const r = white_spread_dfs(x, y - 1, whites, white_index, last_number)
        if(r < 0) return -1
        area += r
    }
    if(y < nrows - 1 && board[x][y + 1].color == WHITE && whites[x][y + 1] < white_index) {
        const r = white_spread_dfs(x, y + 1, whites, white_index, last_number)
        if(r < 0) return -1
        area += r
    }

    return area
}

function render_board() {
    gameBoard.innerHTML = "";
    /*gameBoard.className = "board"*/
 
    for (let y = 0; y < nrows; ++y) {
        for (let x = 0; x < ncols; ++x) {
            const cell = document.createElement("div");
            cell.className = "cell";
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

            if (board[x][y].number > 0) {
                const ttt = document.createElement("p")
                ttt.className = "cell_text";
                ttt.textContent = board[x][y].number
                cell.appendChild(ttt)
            }
            cell.addEventListener("click", () => click_cell(x, y));
            gameBoard.appendChild(cell);
        }
        gameBoard.appendChild(document.createElement("br"));
    }
}
 
initialize_board();
handle_board_after_change();
render_board();