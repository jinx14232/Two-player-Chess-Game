class Piece{
    constructor(color, piece, svg, image){
        this.color = color;
        this.piece = piece;
        this.pieceSvg= svg;
        this.pieceImg= image;
        this.targetPositions= [];
        this.takePositions= [];

        this.svg= `<div class="piece ${this.color}" piece="${this.piece}" >${this.pieceSvg}</div>`;

        this.currentImg= `<div class="piece ${this.color}" piece="${this.piece}" >${this.pieceImg}</div>`;
    }
    takeMove(currrentPosition, boardPieces){
        this.takePositions= [];
        //const validPos= this.validMove(currrentPosition, boardPieces);
        this.targetPositions.forEach(t=>{
            if(boardPieces[t]) this.takePositions.push(t);
        })
        return this.takePositions;
        
    }
    checkForCheck(boardPieces, targetPiece, targetColor){
        console.log('in check for check, looking for ', targetPiece, ' of color ', targetColor)
        let check= {
            by: [],
            at: null
        };

        boardPieces.forEach((chessPiece, i)=>{ //white

            if(!chessPiece || chessPiece.piece== 'king' || chessPiece.color==targetColor) return; // if null
            let tempTargets= chessPiece.validMove(i, boardPieces); //filling target positions for each piece
            tempTargets= chessPiece.takeMove(i, boardPieces) //then converting them into take positions if any

            if(tempTargets.length== 0) return;


            for(let j= 0; j< tempTargets.length; j++){
                let target= tempTargets[j];
                if(boardPieces[target] && boardPieces[target].piece == targetPiece && boardPieces[target].color== targetColor){
                    check.by.push(chessPiece);
                    check.at= target;
                }
            }
        })

        return check;
    }
    findBlockPositions(checkInfo, boardPieces) {
        // Returns squares where a piece can block the check
        let blockSquares = [];
        let checkedBy = checkInfo.by[0]; // Only ranged pieces can be blocked
        let kingPos = checkInfo.at;
        
        // Only rook, bishop, queen can be blocked
        if (checkedBy.piece === 'king' || checkedBy.piece === 'knight' || checkedBy.piece === 'pawn') {
            return blockSquares;
        }
        
        let checkerPos = boardPieces.indexOf(checkedBy);
        let blockPath = this.getPathBetween(checkerPos, kingPos, boardPieces);
        
        return blockPath;
    }
    
    getPathBetween(fromPos, toPos, boardPieces) {
        // Returns array of squares between two positions (excluding endpoints)
        let path = [];
        let fromRow = Math.floor(fromPos / 8);
        let fromCol = fromPos % 8;
        let toRow = Math.floor(toPos / 8);
        let toCol = toPos % 8;
        
        let dRow = toRow - fromRow;
        let dCol = toCol - fromCol;
        let steps = Math.max(Math.abs(dRow), Math.abs(dCol));
        
        if (steps === 0) return path;
        
        let stepRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
        let stepCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);
        
        for (let i = 1; i < steps; i++) {
            let r = fromRow + stepRow * i;
            let c = fromCol + stepCol * i;
            path.push(r * 8 + c);
        }
        return path;
    }

    captureChecker(checkedbys, boardPieces) {
        let captureInfo = [];
        let capturePiece
        checkedbys.forEach(checkedby => {
            capturePiece = checkedby.piece;
            let captureAt = boardPieces.indexOf(checkedby);
            let reqColor = checkedby.color;
            captureInfo= (this.checkForCheck(boardPieces, capturePiece, reqColor).by);
        });
        return captureInfo;
    }
    escapeCheck(checkInfo, boardPieces){
        let savemoves= [];
        let cPosition= checkInfo.at; // index
        let king= boardPieces[cPosition];
        let checkedBy= checkInfo.by; //piece
        let possibleMoves= King.prototype.validMove(cPosition, boardPieces).filter(t => {
            return boardPieces[t] == null || boardPieces[t].color != king.color;
        });
        possibleMoves.forEach(move=>{
            //internally placing king there
            let orgPiece= boardPieces[move]; 
            boardPieces[move]= king;
            boardPieces[cPosition]= null;

            let dangMoves= this.checkForCheck(boardPieces, 'king', king.color);
            if(dangMoves.at){
                console.log('will check at ', dangMoves.at, ' by ', dangMoves.by);
                // don't add to savemoves
            } else {
                savemoves.push(move);
            }
            boardPieces[move]= orgPiece;
        })
        boardPieces[cPosition]= king;
        if(savemoves.length== 0) 
            return false;
        else 
            return savemoves;

    }

}

class Pawn extends Piece{
    constructor(color){
        super(color, 'pawn','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 32C386.3 32 440 85.7 440 152C440 179 431.1 203.9 416 224C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288L405.3 288L432 448L488.2 518.3C493.2 524.6 496 532.4 496 540.5C496 560.1 480.1 576 460.5 576L179.5 576C159.9 576 144 560.1 144 540.5C144 532.4 146.7 524.6 151.8 518.3L208 448L234.7 288L224 288C206.3 288 192 273.7 192 256C192 238.3 206.3 224 224 224C208.9 203.9 200 179 200 152C200 85.7 253.7 32 320 32z"/></svg>', '');
        this.movedbefore = false;
    }
    validMove(currentPosition, boardPieces){
        this.targetPositions = [];
        // let direction = this.color === 'white' ? -8 : 8;
        let direction = -8;
        let single = currentPosition + direction;
        if (single >= 0 && single <= 63 && boardPieces[single] === null) {
            this.targetPositions.push(single);
        }
        if (!this.movedbefore) {
            let double = currentPosition + 2 * direction;
            let intermediate = currentPosition + direction;
            if (double >= 0 && double <= 63 && boardPieces[double] === null && boardPieces[intermediate] === null) {
                this.targetPositions.push(double);
            }
        }
        let tP= this.takeMove(currentPosition, boardPieces);
        tP.forEach(pos=>{
            if(boardPieces[pos]? boardPieces[pos].color!= boardPieces[currentPosition].color: false)
                this.targetPositions.push(pos);
        })
        return this.targetPositions;
    }

    takeMove(currentPosition, boardPieces){
        this.takePositions= [];
        let direction = -8;
        let left = currentPosition + direction - 1;
        let right = currentPosition + direction + 1;
        let row = Math.floor(currentPosition/8);
        let expectedRow = row - 1;
        if(left >= 0 && left <= 63 && Math.floor(left/8) === expectedRow){ // checks if the left diagonal is a valid capture move
            this.takePositions.push(left);
        }

        if(right >= 0 && right <= 63 && Math.floor(right/8) === expectedRow){// checks if the right diagonal is a valid capture move
            this.takePositions.push(right);
        }  
        return this.takePositions;
    }
}
class Rook extends Piece{
    constructor(color){
        super(color, 'rook', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 96L128 197.5C128 214.5 134.7 230.8 146.7 242.8L192 288L192 448L135.8 518.3C130.7 524.6 128 532.4 128 540.5C128 560.1 143.9 576 163.5 576L476.4 576C496 576 511.9 560.1 511.9 540.5C511.9 532.4 509.2 524.6 504.1 518.3L447.9 448L447.9 288L493.2 242.7C505.2 230.7 511.9 214.4 511.9 197.4L512 96C512 78.3 497.7 64 480 64L448 64C430.3 64 416 78.3 416 96L416 128L368 128L368 96C368 78.3 353.7 64 336 64L304 64C286.3 64 272 78.3 272 96L272 128L224 128L224 96C224 78.3 209.7 64 192 64L160 64C142.3 64 128 78.3 128 96z"/></svg>', '<img src="/pieces/rook/rook.png" alt="Rook" />' )
        this.movedbefore = false;
    }
    validMove(currentPosition, boardPieces){
        this.targetPositions = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // col, row deltas for right, left, down, up
        let row = Math.floor(currentPosition / 8);
        let col = currentPosition % 8;
        directions.forEach(([dc, dr]) => {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                let target = r * 8 + c;
                if (boardPieces[target]) {
                    if (boardPieces[target].color !== this.color) {
                        this.targetPositions.push(target);
                    }
                    break;
                }
                this.targetPositions.push(target);
                r += dr;
                c += dc;
            }
        });
        return this.targetPositions;
    }

}
class Knight extends Piece{
    constructor(color){
        super(color, 'knight', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 32C426 32 512 118 512 224L512 357.5C512 374.5 505.2 390.7 493.3 402.7L448 448L498.8 498.7C507.3 507.2 512 518.7 512 530.7C512 555.7 491.7 575.9 466.8 576L173.3 576C148.3 576 128.1 555.7 128.1 530.7C128.1 518.7 132.9 507.2 141.3 498.7L192 448L192 413.4C192 394.7 200.2 377 214.3 364.8L304 288L256 288L243.9 300.1C231.2 312.8 213.9 320 195.9 320C158.4 320 128 289.6 128 252.1L128 243.4C128 220.6 136.2 198.5 151.1 181.1L224 96L224 64C224 46.3 238.3 32 256 32L320 32zM288 136C274.7 136 264 146.7 264 160C264 173.3 274.7 184 288 184C301.3 184 312 173.3 312 160C312 146.7 301.3 136 288 136z"/></svg>', '<img src="/pieces/knight/knight.png" alt="Knight" />' ) 
    }
    validMove(currentPosition, boardPieces){
        this.targetPositions= [];
        const targets = [
          [2, 1],
          [2, -1],
          [-2, 1],
          [-2, -1],
          [1, 2],
          [1, -2],
          [-1, 2],
          [-1, -2],
        ];
        let row= Math.floor(currentPosition/ 8)
        let col= currentPosition% 8;
        targets.forEach(([tr, tc])=>{
            let tRow= row+ tr;
            let tCol= col+ tc; 
            if(tRow >= 0 && tRow < 8 && tCol >= 0 && tCol < 8 ){
                let target= tRow * 8 + tCol;
                if(boardPieces[target]!= null){
                    if(boardPieces[target].color== this.color) return;
                    this.targetPositions.push(target)
                    return;
                }
                this.targetPositions.push(target)
            }
        })
        return this.targetPositions;
        
    }
}
class Bishop extends Piece{
    constructor(color){
        super(color, 'bishop', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M224 448L208.3 432.3C177.4 401.4 160 359.4 160 315.7C160 277.1 173.5 239.8 198.2 210.1L266.7 128L256 128C238.3 128 224 113.7 224 96C224 78.3 238.3 64 256 64L384 64C401.7 64 416 78.3 416 96C416 113.7 401.7 128 384 128L373.3 128L420.9 185.1L335 271C325.6 280.4 325.6 295.6 335 304.9C344.4 314.2 359.6 314.3 368.9 304.9L451.2 222.6C469.9 249.9 479.9 282.3 479.9 315.6C479.9 359.3 462.5 401.3 431.6 432.2L416 448L472.2 518.3C477.2 524.6 480 532.4 480 540.5C480 560.1 464.1 576 444.5 576L195.5 576C175.9 576 160 560.1 160 540.5C160 532.4 162.7 524.6 167.8 518.3L224 448z"/></svg>', '<img src="/pieces/bishop/bishop.png" alt="Bishop" />' )
    }
    validMove(currentPosition, boardPieces){
        this.targetPositions = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // row, col deltas
        let row = Math.floor(currentPosition / 8);
        let col = currentPosition % 8;
        directions.forEach(([dr, dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                let target = r * 8 + c;
                if (boardPieces[target]) {
                    if (boardPieces[target].color !== this.color) {
                        this.targetPositions.push(target);
                    }
                    break;
                }
                this.targetPositions.push(target);
                r += dr;
                c += dc;
            }
        });
        return this.targetPositions;
    }

}
class Queen extends Piece{
    constructor(color){
        super(color, 'queen', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 144C346.5 144 368 122.5 368 96C368 69.5 346.5 48 320 48C293.5 48 272 69.5 272 96C272 122.5 293.5 144 320 144zM69.5 249L192 448L135.8 518.3C130.8 524.6 128 532.4 128 540.5C128 560.1 143.9 576 163.5 576L476.4 576C496 576 511.9 560.1 511.9 540.5C511.9 532.4 509.2 524.6 504.1 518.3L448 448L570.5 249C574.1 243.1 576 236.3 576 229.4L576 228.8C576 208.5 559.5 192 539.2 192C531.9 192 524.8 194.2 518.8 198.2L501.9 209.5C489.2 218 472.3 216.3 461.5 205.5L427.4 171.4C420.1 164.1 410.2 160 400 160C389.8 160 379.9 164.1 372.7 171.3L342.6 201.4C330.1 213.9 309.8 213.9 297.3 201.4L267.2 171.3C260.1 164.1 250.2 160 240 160C229.8 160 219.9 164.1 212.7 171.3L178.6 205.4C167.8 216.2 150.9 217.9 138.2 209.4L121.3 198.2C115.2 194.2 108.1 192 100.9 192C80.6 192 64.1 208.5 64.1 228.8L64.1 229.4C64.1 236.3 66 243.1 69.6 249z"/></svg>', '<img src="/pieces/queen/queen.png" alt="Queen" />' )
    }
    validMove(currentPosition, boardPieces){
        this.targetPositions = [];
        // Rook moves
        const rookDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        // Bishop moves
        const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        const allDirections = rookDirections.concat(bishopDirections);
        let row = Math.floor(currentPosition / 8);
        let col = currentPosition % 8;
        allDirections.forEach(([dr, dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                let target = r * 8 + c;
                if (boardPieces[target]) {
                    if (boardPieces[target].color !== this.color) {
                        this.targetPositions.push(target);
                    }
                    break;
                }
                this.targetPositions.push(target);
                r += dr;
                c += dc;
            }
        });
        return this.targetPositions;
    }

}
class King extends Piece{
    constructor(color){
        super(color, 'king','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 32C337.7 32 352 46.3 352 64L352 96L384 96C401.7 96 416 110.3 416 128C416 145.7 401.7 160 384 160L352 160L352 224L505.8 224C526.9 224 544 241.1 544 262.2C544 268.6 542.4 274.9 539.3 280.5L448 448L504.2 518.3C509.2 524.6 512 532.4 512 540.5C512 560.1 496.1 576 476.5 576L163.5 576C143.9 576 128 560.1 128 540.5C128 532.4 130.7 524.6 135.8 518.3L192 448L100.7 280.6C97.6 274.9 96 268.6 96 262.2C96 241.1 113.1 224 134.2 224L288 224L288 160L256 160C238.3 160 224 145.7 224 128C224 110.3 238.3 96 256 96L288 96L288 64C288 46.3 302.3 32 320 32z"/></svg>', '<img src="/pieces/king/king.png" alt="King" />' )
        this.movedbefore = false;
    }
    validMove(currentPosition, boardPieces){
        //cp -1, cp+1, 
        this.targetPositions= [];
        let targets= [currentPosition+ 1, currentPosition- 1,
                         (currentPosition+ 8), (currentPosition+ 8)+ 1, (currentPosition+ 8)- 1,
                         (currentPosition- 8), (currentPosition- 8)+ 1, (currentPosition- 8)- 1
                        ]
        targets.forEach(target=>{
            if(target>= 0 && target<= 63){
                if(boardPieces[target]!= null){
                    if(boardPieces[target].color== this.color) return;
                    this.targetPositions.push(target)
                    return;
                }
                this.targetPositions.push(target)
            }
        })
        let king= boardPieces[currentPosition];

        this.targetPositions= this.targetPositions.filter(pos=>{
            let orgPiece= boardPieces[pos]; 
            boardPieces[pos]= king;
            boardPieces[currentPosition]= null;
            let dangMoves= this.checkForCheck(boardPieces, 'king', this.color);
            if(dangMoves.at){
                console.log('will check at ', dangMoves.at, ' by ', dangMoves.by.piece);
                // don't add to savemoves
            } else {
                boardPieces[pos]= orgPiece;
                return pos;
            }
            boardPieces[pos]= orgPiece;
        })
        boardPieces[currentPosition]= king;
        return this.targetPositions;
        
    }

}