class Piece{
    constructor(color, piece, svg, currentSvg){
        this.color = color;
        this.piece = piece;
        this.pieceSvg= svg;
        this.currentPieceSvg= currentSvg;
        this.targetPositions= [];
        this.takePositions= [];

        this.svg= `<div class="piece ${this.color}" piece="${this.piece}" >${this.pieceSvg}</div>`;

        this.currentSvg= `<div class="piece ${this.color} currentSvg" piece="${this.piece}" >${this.currentPieceSvg}</div>`;
        
    }

    takeMove(currrentPosition, boardPieces){
        this.takePositions= [];
        //const validPos= this.validMove(currrentPosition, boardPieces);
        this.targetPositions.forEach(t=>{
            if(boardPieces[t]) this.takePositions.push(t);
        })
        return this.takePositions;
    }

    underAttack(boardPieces, checkColor, checkIdx){
        let underAttack= false;

        boardPieces.forEach((chessPiece, i)=>{
            if(!chessPiece || chessPiece.color== checkColor || chessPiece.piece== 'king') return;
            
            let tempTargets= chessPiece.piece== 'pawn'? chessPiece.takeMove(i, boardPieces, 'true') : chessPiece.validMove(i, boardPieces);
            if(tempTargets.length== 0) return;

            if(tempTargets.includes(checkIdx)) underAttack= true;
        })

        return underAttack;
    }
    // Attacked(boardPieces, checkColor, checkIdx){
    //     let attackedBy= [];

    //     boardPieces.forEach((chessPiece, i)=>{
    //         if(!chessPiece || chessPiece.color== checkColor || chessPiece.piece== 'king' ) return;
            
    //         let tempTargets= chessPiece.piece== 'pawn'? chessPiece.takeMove(i, boardPieces, 'true') : chessPiece.validMove(i, boardPieces);
    //         if(tempTargets.length== 0) return;

    //         if(tempTargets.includes(checkIdx)) attackedBy.push(chessPiece);
    //     })

    //     return attackedBy;
    // }
    checkPin(boardPieces, king, kingColor){
        
        let attacked= false;

        boardPieces.some((chessPiece, i)=>{ //white

            if(!chessPiece || chessPiece.piece== 'king' || chessPiece.color== kingColor) return; // if null
            
            let tempTargets= chessPiece.piece== 'pawn'? chessPiece.takeMove(i, boardPieces, 'true') : chessPiece.validMove(i, boardPieces);
            if(tempTargets.length== 0) return;
            
            tempTargets.some(target=>{
                if(boardPieces[target] && boardPieces[target].piece == king && boardPieces[target].color== kingColor){
                    attacked= true;
                    return true;
                }
            })

            if(attacked) return true;

        })
        return attacked;
    }

    checkForCheck(boardPieces, king, kingColor){
        let check= {
            by: [],
            at: null
        };
        console.log('checking for check on ', king, ' of color ', kingColor);
        boardPieces.forEach((chessPiece, i)=>{ //white

            if(!chessPiece || chessPiece.piece== 'king' || chessPiece.color==kingColor) return; // if null
            
            let tempTargets= chessPiece.piece== 'pawn'? chessPiece.takeMove(i, boardPieces, 'true') : chessPiece.validMove(i, boardPieces);
            if(tempTargets.length== 0) return;
            console.log('checking piece ', chessPiece.piece, 'of color ', chessPiece.color, ' at ', i, ' with targets ', tempTargets);
            for(let j= 0; j< tempTargets.length; j++){
                let target= tempTargets[j];
                if(boardPieces[target] && boardPieces[target].piece == king && boardPieces[target].color== kingColor){
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
        if (checkInfo.by.length > 1) return blockSquares;

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

    // captureChecker(checkedbys, boardPieces) {
    //     let captureInfo = [];
    //     let capturePiece;

    //     checkedbys.forEach(checkedby => {
    //         capturePiece = checkedby.piece;
    //         let captureAt = boardPieces.indexOf(checkedby);
    //         let reqColor = checkedby.color;
    //         captureInfo= (this.checkForCheck(boardPieces, capturePiece, reqColor).by);
    //     });

    //     return captureInfo;
    // }
//     escapeCheck(checkInfo, boardPieces){
       
//         let savemoves= [];
//         let KingPosition= checkInfo.at; // index
//         let king= boardPieces[KingPosition];
//         let checkedBy= checkInfo.by; //piece
        
//         let possibleMoves= King.prototype.validMove(KingPosition, boardPieces);

//         possibleMoves.forEach(move=>{
//             //internally placing king there
//             let orgPiece= boardPieces[move]; 
//             boardPieces[move]= king;
//             boardPieces[KingPosition]= null;

//             let dangMoves= this.checkForCheck(boardPieces, 'king', king.color);
//             if(dangMoves.at){
//                 console.log('will check at ', dangMoves.at, ' by ', dangMoves.by);
//                 // don't add to savemoves
//             } else {
//                 savemoves.push(move);
//             }
//             boardPieces[move]= orgPiece;
//         })
//         boardPieces[KingPosition]= king;
//         if(savemoves.length== 0) 
//             return false;
//         else 
//             return savemoves;

//     }
 }

class Pawn extends Piece{
    constructor(color){
        super(color, 'pawn','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 32C386.3 32 440 85.7 440 152C440 179 431.1 203.9 416 224C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288L405.3 288L432 448L488.2 518.3C493.2 524.6 496 532.4 496 540.5C496 560.1 480.1 576 460.5 576L179.5 576C159.9 576 144 560.1 144 540.5C144 532.4 146.7 524.6 151.8 518.3L208 448L234.7 288L224 288C206.3 288 192 273.7 192 256C192 238.3 206.3 224 224 224C208.9 203.9 200 179 200 152C200 85.7 253.7 32 320 32z"/></svg>', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="50" height="50">
  <g fill="color">
    <circle cx="50" cy="20" r="14"/>
    <ellipse cx="50" cy="40" rx="10" ry="5"/>
    <path d="M40 44 Q35 58 35 70 Q35 82 40 90 L60 90 Q65 82 65 70 Q65 58 60 44 Z"/>
    <ellipse cx="50" cy="90" rx="18" ry="6"/>
    <path d="M32 92 Q28 104 26 112 L74 112 Q72 104 68 92 Z"/>
    <rect x="22" y="108" width="56" height="8" rx="4"/>
  </g>
</svg>`);
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

    takeMove(currentPosition, boardPieces, flipped= false){
        this.takePositions= [];
        let direction = flipped? 8: -8;
        let left = currentPosition + direction - 1;
        let right = currentPosition + direction + 1;
        let row = Math.floor(currentPosition/8);
        let expectedRow = flipped ? row + 1 : row - 1;
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
        super(color, 'rook', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 96L128 197.5C128 214.5 134.7 230.8 146.7 242.8L192 288L192 448L135.8 518.3C130.7 524.6 128 532.4 128 540.5C128 560.1 143.9 576 163.5 576L476.4 576C496 576 511.9 560.1 511.9 540.5C511.9 532.4 509.2 524.6 504.1 518.3L447.9 448L447.9 288L493.2 242.7C505.2 230.7 511.9 214.4 511.9 197.4L512 96C512 78.3 497.7 64 480 64L448 64C430.3 64 416 78.3 416 96L416 128L368 128L368 96C368 78.3 353.7 64 336 64L304 64C286.3 64 272 78.3 272 96L272 128L224 128L224 96C224 78.3 209.7 64 192 64L160 64C142.3 64 128 78.3 128 96z"/></svg>', `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="50px" height="60px" viewBox="0 0 404.000000 600.000000"
 preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
fill="color" stroke="none">
<path d="M608 5979 c-17 -9 -18 -42 -18 -455 0 -493 -1 -485 65 -543 81 -71
-26 -66 1360 -66 l1250 0 45 21 c53 26 93 62 117 107 16 29 18 71 18 474 0
349 -3 445 -13 455 -10 10 -73 14 -256 16 -214 3 -246 1 -260 -13 -14 -14 -16
-46 -16 -226 0 -196 -1 -210 -20 -229 -19 -19 -33 -20 -210 -20 -177 0 -191 1
-210 20 -19 19 -20 33 -20 228 0 190 -2 210 -18 225 -17 15 -60 17 -413 17
-326 0 -399 -2 -415 -14 -18 -14 -19 -26 -16 -221 4 -275 23 -255 -228 -255
-166 0 -189 2 -203 18 -13 14 -16 52 -19 230 -3 198 -4 215 -22 228 -16 11
-67 14 -250 14 -138 0 -238 -5 -248 -11z"/>
<path d="M942 4768 c-15 -15 -16 -139 -1 -192 14 -52 80 -121 137 -143 44 -17
102 -18 937 -17 643 0 901 4 930 12 54 15 113 67 136 116 25 55 27 221 3 230
-9 3 -491 6 -1073 6 -809 0 -1060 -3 -1069 -12z"/>
<path d="M1349 4273 l-96 -4 -6 -202 c-7 -211 -36 -551 -62 -722 -9 -55 -20
-131 -25 -170 -16 -124 -87 -475 -128 -635 -46 -178 -135 -457 -164 -513 -11
-22 -17 -45 -14 -53 5 -12 179 -14 1166 -14 1268 0 1188 -4 1156 57 -8 16 -33
83 -56 149 -112 323 -194 672 -249 1054 -57 391 -69 517 -79 830 l-7 215 -130
6 c-130 7 -1126 8 -1306 2z"/>
<path d="M730 1821 c-99 -14 -157 -62 -167 -141 -9 -62 4 -102 52 -160 52 -63
60 -93 45 -150 -14 -54 -69 -108 -220 -221 -212 -158 -279 -258 -280 -411 0
-86 -184 -79 1874 -76 1611 3 1828 5 1837 18 5 8 8 47 7 85 -6 130 -84 246
-253 374 -38 29 -98 74 -132 99 -34 26 -73 65 -87 87 -43 65 -32 149 24 200
86 77 59 224 -50 278 l-45 22 -1275 1 c-701 1 -1300 -1 -1330 -5z"/>
<path d="M141 510 c-40 -9 -77 -35 -105 -74 -19 -25 -21 -41 -21 -193 l0 -165
32 -28 c25 -22 45 -30 95 -35 35 -3 904 -5 1933 -3 1501 2 1874 6 1893 16 48
27 56 56 60 204 4 133 3 140 -22 192 -49 101 163 91 -1966 93 -1026 0 -1880
-2 -1899 -7z"/>
</g>
</svg>` )
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
        super(color, 'knight', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 32C426 32 512 118 512 224L512 357.5C512 374.5 505.2 390.7 493.3 402.7L448 448L498.8 498.7C507.3 507.2 512 518.7 512 530.7C512 555.7 491.7 575.9 466.8 576L173.3 576C148.3 576 128.1 555.7 128.1 530.7C128.1 518.7 132.9 507.2 141.3 498.7L192 448L192 413.4C192 394.7 200.2 377 214.3 364.8L304 288L256 288L243.9 300.1C231.2 312.8 213.9 320 195.9 320C158.4 320 128 289.6 128 252.1L128 243.4C128 220.6 136.2 198.5 151.1 181.1L224 96L224 64C224 46.3 238.3 32 256 32L320 32zM288 136C274.7 136 264 146.7 264 160C264 173.3 274.7 184 288 184C301.3 184 312 173.3 312 160C312 146.7 301.3 136 288 136z"/></svg>', `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="50px" height="60px" viewBox="0 0 364.000000 600.000000"
 preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
fill="color" stroke="none">
<path d="M2161 5979 c-43 -17 -185 -135 -273 -226 -106 -112 -169 -195 -219
-295 -22 -43 -43 -78 -48 -78 -27 0 -27 76 0 192 12 49 18 92 15 96 -10 10
-97 4 -173 -12 -170 -36 -383 -134 -553 -254 -122 -86 -335 -298 -429 -428
-261 -359 -400 -741 -445 -1219 -23 -243 -26 -332 -11 -351 11 -15 79 -26 203
-33 22 -2 13 -26 -15 -42 -16 -9 -56 -26 -90 -38 -33 -13 -71 -32 -83 -43 -21
-20 -22 -27 -17 -127 7 -142 13 -156 79 -176 29 -8 92 -18 140 -22 49 -3 88
-9 88 -12 0 -7 -82 -50 -165 -86 -69 -30 -75 -37 -75 -88 0 -50 97 -420 138
-527 21 -54 28 -55 266 -55 l221 0 -2 47 c-2 26 -39 157 -87 300 -150 449
-186 601 -208 881 -43 560 143 1165 468 1516 101 110 337 304 398 327 40 15 6
-27 -127 -159 -176 -175 -252 -281 -361 -502 -191 -385 -256 -716 -229 -1167
13 -205 47 -382 127 -659 99 -340 126 -468 126 -588 0 -89 -30 -222 -67 -294
-13 -27 -22 -51 -20 -53 10 -11 791 -15 1465 -9 831 8 740 -6 749 120 16 205
-65 490 -202 716 -109 180 -216 314 -448 562 -190 205 -253 296 -299 432 l-34
100 -108 55 c-176 89 -271 183 -344 339 -33 71 -36 84 -40 198 -2 67 -2 134 2
148 10 39 34 30 46 -17 30 -118 45 -159 82 -230 49 -95 133 -188 230 -255 139
-96 268 -118 441 -74 105 27 110 26 282 -63 278 -145 312 -172 378 -301 29
-57 79 -109 120 -124 79 -30 242 0 280 51 11 15 30 28 41 28 12 0 53 17 91 38
64 35 73 44 102 103 53 104 80 328 49 402 -16 40 -91 131 -211 256 -245 255
-518 576 -564 661 -16 30 -38 87 -49 126 -22 84 -54 127 -187 251 -137 128
-305 233 -373 233 -37 0 -39 16 -21 149 11 85 15 155 10 207 -6 84 -13 92 -60
73z m328 -1063 c62 -32 109 -79 134 -135 19 -43 19 -45 1 -58 -30 -22 -189
-17 -239 7 -60 29 -180 180 -155 195 50 31 189 26 259 -9z"/>
<path d="M551 1662 c-61 -30 -75 -65 -72 -169 1 -39 51 -100 97 -119 63 -27
67 -59 18 -164 -38 -82 -65 -112 -187 -209 -146 -116 -196 -178 -212 -264 -9
-45 17 -122 45 -137 12 -7 553 -10 1529 -10 1483 0 1510 0 1521 19 5 11 10 47
10 81 0 104 -59 193 -199 299 -124 95 -183 172 -215 280 -15 53 -9 91 15 91
27 0 92 55 110 93 25 57 25 137 -1 170 -47 59 -5 57 -1269 57 -1081 0 -1158
-1 -1190 -18z"/>
<path d="M166 445 c-50 -17 -92 -59 -108 -104 -6 -20 -11 -76 -11 -124 2 -98
19 -146 67 -181 27 -21 31 -21 1594 -24 1091 -1 1583 1 1619 8 38 8 59 20 78
41 37 45 58 129 53 214 -6 88 -30 128 -97 159 l-46 21 -1555 2 c-1304 2 -1561
0 -1594 -12z"/>
</g>
</svg>` ) 
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
        super(color, 'bishop', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M224 448L208.3 432.3C177.4 401.4 160 359.4 160 315.7C160 277.1 173.5 239.8 198.2 210.1L266.7 128L256 128C238.3 128 224 113.7 224 96C224 78.3 238.3 64 256 64L384 64C401.7 64 416 78.3 416 96C416 113.7 401.7 128 384 128L373.3 128L420.9 185.1L335 271C325.6 280.4 325.6 295.6 335 304.9C344.4 314.2 359.6 314.3 368.9 304.9L451.2 222.6C469.9 249.9 479.9 282.3 479.9 315.6C479.9 359.3 462.5 401.3 431.6 432.2L416 448L472.2 518.3C477.2 524.6 480 532.4 480 540.5C480 560.1 464.1 576 444.5 576L195.5 576C175.9 576 160 560.1 160 540.5C160 532.4 162.7 524.6 167.8 518.3L224 448z"/></svg>', `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="50px" height="70px" viewBox="0 0 312.000000 600.000000"
 preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
fill="color" stroke="none">
<path d="M1472 5923 c-242 -257 -416 -510 -502 -731 -66 -166 -82 -242 -87
-398 -5 -122 -2 -152 16 -224 38 -146 146 -334 216 -377 27 -16 63 -18 409
-21 426 -3 466 1 513 51 70 75 161 241 187 342 42 164 29 326 -40 535 -52 153
-69 190 -88 190 -19 0 -161 -165 -233 -270 -52 -76 -81 -100 -123 -100 -58 0
-90 36 -90 99 0 50 1 52 124 198 121 145 199 226 227 235 26 9 -92 176 -263
372 -111 126 -154 166 -179 166 -16 0 -43 -21 -87 -67z"/>
<path d="M1025 3994 c-80 -8 -105 -15 -135 -41 -103 -86 -91 -248 24 -318 l49
-30 586 0 c542 0 590 1 633 18 88 34 126 102 116 208 -6 59 -44 112 -104 143
-38 20 -53 21 -584 22 -300 1 -563 0 -585 -2z"/>
<path d="M1164 3425 c-18 -12 -22 -29 -28 -107 -36 -491 -184 -1036 -366
-1348 -23 -39 -39 -78 -36 -86 5 -12 122 -14 826 -14 723 0 821 2 826 15 4 8
-9 41 -28 73 -192 324 -330 827 -374 1361 -11 131 24 121 -422 121 -315 0
-381 -2 -398 -15z"/>
<path d="M522 1665 c-40 -19 -56 -33 -67 -59 -21 -49 -19 -124 4 -166 30 -57
59 -72 153 -79 69 -5 83 -9 86 -24 5 -22 -97 -121 -226 -220 -161 -123 -221
-176 -248 -223 -64 -109 -68 -212 -9 -271 l33 -33 1311 0 1311 0 38 34 c36 34
37 36 37 108 0 61 -5 82 -29 128 -37 72 -60 95 -191 198 -206 161 -320 274
-298 296 4 3 34 6 67 7 75 0 142 25 170 62 16 22 21 43 21 96 0 59 -4 72 -29
105 -53 70 10 66 -1088 66 l-993 0 -53 -25z"/>
<path d="M195 411 c-84 -13 -150 -61 -174 -124 -28 -72 -1 -182 54 -225 69
-54 19 -52 1506 -50 l1374 3 47 22 c155 71 136 311 -29 364 -29 9 -362 13
-1383 15 -740 1 -1368 -1 -1395 -5z"/>
</g>
</svg>` )
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
        super(color, 'queen', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 144C346.5 144 368 122.5 368 96C368 69.5 346.5 48 320 48C293.5 48 272 69.5 272 96C272 122.5 293.5 144 320 144zM69.5 249L192 448L135.8 518.3C130.8 524.6 128 532.4 128 540.5C128 560.1 143.9 576 163.5 576L476.4 576C496 576 511.9 560.1 511.9 540.5C511.9 532.4 509.2 524.6 504.1 518.3L448 448L570.5 249C574.1 243.1 576 236.3 576 229.4L576 228.8C576 208.5 559.5 192 539.2 192C531.9 192 524.8 194.2 518.8 198.2L501.9 209.5C489.2 218 472.3 216.3 461.5 205.5L427.4 171.4C420.1 164.1 410.2 160 400 160C389.8 160 379.9 164.1 372.7 171.3L342.6 201.4C330.1 213.9 309.8 213.9 297.3 201.4L267.2 171.3C260.1 164.1 250.2 160 240 160C229.8 160 219.9 164.1 212.7 171.3L178.6 205.4C167.8 216.2 150.9 217.9 138.2 209.4L121.3 198.2C115.2 194.2 108.1 192 100.9 192C80.6 192 64.1 208.5 64.1 228.8L64.1 229.4C64.1 236.3 66 243.1 69.6 249z"/></svg>', `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="50px" height="70px" viewBox="0 0 271.000000 600.000000"
 preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
fill="color" stroke="none">
<path d="M1300 5982 c-56 -25 -100 -88 -100 -145 0 -45 12 -71 53 -114 l30
-32 -28 -63 c-81 -187 -199 -376 -270 -433 -96 -79 -203 -97 -299 -49 -71 36
-108 72 -96 95 6 10 10 35 10 56 0 150 -187 194 -256 61 -33 -64 -3 -144 68
-183 33 -18 45 -37 114 -185 42 -91 102 -235 134 -320 71 -196 81 -215 105
-214 11 1 85 10 165 20 195 25 661 25 859 1 74 -10 137 -19 139 -22 3 -2 12 0
21 5 17 9 38 57 107 245 20 55 73 178 118 274 75 161 84 176 121 197 72 39 98
121 61 192 -31 61 -103 86 -168 59 -62 -26 -92 -96 -76 -172 8 -37 7 -42 -19
-63 -84 -70 -204 -92 -290 -53 -54 25 -126 92 -173 161 -42 62 -147 258 -181
338 l-22 53 32 31 c78 76 59 203 -40 253 -29 15 -92 19 -119 7z"/>
<path d="M1045 4379 c-149 -13 -292 -37 -325 -54 -58 -30 -75 -86 -45 -145 22
-43 63 -60 144 -60 69 0 71 -1 87 -32 23 -45 23 -197 0 -258 -10 -25 -20 -53
-23 -62 -5 -17 22 -18 465 -18 259 0 473 3 476 8 2 4 -5 34 -16 67 -26 79 -22
214 8 266 20 34 21 34 81 31 100 -6 153 35 153 116 0 79 -33 95 -260 129 -125
18 -595 26 -745 12z"/>
<path d="M1785 3660 c-223 -14 -529 -16 -816 -6 l-266 9 -33 -30 c-26 -24 -33
-38 -37 -79 -10 -106 34 -144 168 -144 116 0 124 -7 150 -130 41 -194 36 -560
-12 -854 -25 -158 -91 -402 -145 -544 -44 -113 -150 -334 -185 -384 -11 -14
-19 -30 -19 -35 0 -15 710 -25 1148 -17 210 4 382 9 382 12 0 2 -22 44 -50 93
-160 284 -263 606 -317 989 -36 260 -18 733 32 830 19 36 31 40 128 40 45 0
93 6 106 13 84 43 87 170 6 223 -32 21 -73 23 -240 14z"/>
<path d="M450 1353 c-40 -17 -52 -76 -25 -123 20 -36 18 -87 -5 -125 -11 -18
-65 -70 -119 -114 -55 -45 -120 -105 -145 -134 -102 -116 -113 -255 -29 -348
73 -81 -36 -74 1218 -74 616 0 1132 3 1146 7 48 14 116 84 135 140 43 130 -20
257 -191 386 -167 126 -200 183 -155 271 25 46 19 85 -15 107 -20 13 -70 14
-406 3 -346 -10 -694 -8 -1219 6 -96 3 -182 2 -190 -2z"/>
<path d="M97 326 c-44 -16 -62 -37 -77 -86 -11 -39 -13 -142 -4 -178 15 -54
-43 -52 1353 -52 l1290 0 21 27 c19 25 21 38 18 113 -4 94 -18 132 -61 164
l-28 21 -1237 2 c-1026 2 -1244 0 -1275 -11z"/>
</g>
</svg>
`)
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
        super(color, 'king','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 32C337.7 32 352 46.3 352 64L352 96L384 96C401.7 96 416 110.3 416 128C416 145.7 401.7 160 384 160L352 160L352 224L505.8 224C526.9 224 544 241.1 544 262.2C544 268.6 542.4 274.9 539.3 280.5L448 448L504.2 518.3C509.2 524.6 512 532.4 512 540.5C512 560.1 496.1 576 476.5 576L163.5 576C143.9 576 128 560.1 128 540.5C128 532.4 130.7 524.6 135.8 518.3L192 448L100.7 280.6C97.6 274.9 96 268.6 96 262.2C96 241.1 113.1 224 134.2 224L288 224L288 160L256 160C238.3 160 224 145.7 224 128C224 110.3 238.3 96 256 96L288 96L288 64C288 46.3 302.3 32 320 32z"/></svg>', `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
width="50px" height="70px" viewBox="0 0 265.000000 600.000000"
 preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
fill="color" stroke="none">
<path d="M1170 5970 c-24 -24 -24 -39 -5 -145 20 -112 20 -148 -2 -141 -10 3
-69 13 -131 22 -147 23 -145 25 -150 -126 -5 -136 2 -175 33 -196 24 -15 70
-11 233 22 28 6 32 4 32 -15 0 -12 -11 -61 -24 -109 -14 -48 -29 -106 -36
-129 -8 -34 -15 -43 -32 -43 -40 0 -105 -39 -118 -70 -12 -29 -10 -68 4 -102
6 -14 -1 -17 -51 -23 -230 -26 -355 -69 -387 -133 -16 -33 -13 -43 52 -170 59
-115 89 -187 172 -417 78 -215 78 -213 48 -224 -30 -11 -78 -66 -78 -90 0 -9
7 -27 16 -40 35 -50 47 -51 580 -51 443 0 500 2 531 17 37 17 65 65 55 92 -8
26 -42 59 -72 71 l-27 11 22 72 c51 160 159 429 220 550 36 70 65 139 65 153
0 70 -156 133 -392 159 -56 6 -71 16 -47 31 7 4 9 26 6 57 -5 62 -36 93 -100
102 l-43 7 -39 144 c-21 79 -36 146 -33 149 3 3 56 -4 119 -15 140 -24 135
-24 159 0 18 18 20 33 20 159 0 190 6 185 -185 152 -60 -11 -112 -18 -114 -15
-2 2 3 49 12 103 25 146 23 179 -9 191 -14 6 -84 10 -155 10 -116 0 -131 -2
-149 -20z"/>
<path d="M792 3680 c-18 -4 -50 -19 -72 -34 -22 -14 -54 -26 -71 -26 -37 0
-94 -51 -105 -94 -10 -43 12 -102 49 -128 30 -21 44 -23 191 -26 l159 -3 -7
-197 c-14 -396 -62 -763 -142 -1087 -14 -55 -55 -189 -91 -297 -37 -109 -65
-200 -62 -202 13 -12 635 -28 864 -22 408 10 505 17 505 33 0 8 -25 87 -56
176 -144 418 -220 864 -231 1354 l-6 242 156 3 c139 3 159 5 184 24 34 26 59
90 49 129 -11 43 -68 95 -105 95 -16 0 -47 11 -67 25 -20 14 -53 29 -73 35
-42 12 -1019 12 -1069 0z"/>
<path d="M503 1542 c-13 -2 -32 -15 -44 -30 -20 -25 -21 -35 -16 -136 4 -82 2
-116 -8 -135 -15 -28 -79 -92 -217 -215 -114 -101 -153 -174 -152 -281 1 -80
21 -136 57 -160 110 -72 2292 -73 2402 -1 51 34 75 126 55 219 -18 88 -72 159
-209 276 -70 60 -133 123 -147 147 -24 40 -25 48 -19 141 8 116 -1 148 -47
168 -29 11 -46 11 -133 -6 -198 -38 -281 -43 -715 -43 -428 0 -474 3 -685 41
-55 10 -110 17 -122 15z"/>
<path d="M94 470 c-12 -5 -35 -25 -50 -46 -28 -37 -29 -40 -29 -165 0 -145 6
-159 78 -177 129 -32 822 -72 1252 -72 303 0 789 21 1030 45 262 26 260 25
260 205 0 140 -6 157 -68 203 -25 20 -29 20 -154 3 -321 -41 -502 -50 -1063
-50 -594 -1 -805 9 -1200 59 -19 2 -45 0 -56 -5z"/>
</g>
</svg>` )
        this.movedbefore = false;
    }
    validMove(currentPosition, boardPieces){
        //cp -1, cp+1, 
        this.targetPositions= [];
        let targets= [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        let row= Math.floor(currentPosition/ 8)
        let col= currentPosition% 8;
        targets.forEach(([tr, tc])=>{
            let tRow= row+ tr;
            let tCol= col+ tc; 
            if(tRow >= 0 && tRow < 8 && tCol >= 0 && tCol < 8 ){
                let target= tRow * 8 + tCol;
                if(boardPieces[target]? boardPieces[target].color== this.color : false) return;
                if(this.underAttack(boardPieces, this.color, target)) return;
                this.targetPositions.push(target)
            }
        })

        // let king= boardPieces[currentPosition];

        // this.targetPositions= this.targetPositions.filter(pos=>{
        //     let orgPiece= boardPieces[pos]; 
        //     boardPieces[pos]= king;
        //     boardPieces[currentPosition]= null;
        //     let dangMoves= this.checkForCheck(boardPieces, 'king', this.color);
        //     if(dangMoves.at){
        //         console.log('will check at ', dangMoves.at, ' by ', dangMoves.by.piece);
        //         // don't add to savemoves
        //     } else {
        //         boardPieces[pos]= orgPiece;
        //         return pos;
        //     }
        //     boardPieces[pos]= orgPiece;
        // })
        // boardPieces[currentPosition]= king;
        return this.targetPositions;
        
    }

}