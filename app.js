class gameBoard{
    constructor(boardDiv){

        console.log('new features');

        this.boardDiv = boardDiv;
        this.squares= this.addSquares(); //boxes array

        this.boardPieces = this.createPieces(); //creates array of internal pieces
        
        this.promotePannel= document.querySelector('.promotion-overlay')
        this.player= document.querySelector('#player');
        this.status= document.querySelector('#status');
        this.gameMsg= document.querySelector('#msg');
        this.promotionInfo= null;
        
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.selectedPiece= null; //internal piece
        this.selectedIndex= null;
    
        this.activeMoveHandlers = [];

        this.activeClickValidMoves = [];
        this.activeClickTakeMoves = [];

        this.checked= false;
        this.pinned= false;
        
        this.check= {
            by: [],
            at: null
        };
        this.chckMate= {
            escape: false,
            block: false,
            capture: false
        }

        this.castleInfo= {
            can: false,
            kingSide: [],
            queenSide: [],
        }

    }
    createPieces(){
        return [new Rook('black',), new Knight('black'), new Bishop('black'), new Queen('black'), new King('black'), new Bishop('black'), new Knight('black'), new Rook('black'),
            new Pawn('black'), new Pawn('black'), new Pawn('black'), new Pawn('black'), new Pawn('black'), new Pawn('black'), new Pawn('black'), new Pawn('black'),
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            new Pawn('white'), new Pawn('white'), new Pawn('white'), new Pawn('white'), new Pawn('white'), new Pawn('white'), new Pawn('white'), new Pawn('white'),
            new Rook('white'), new Knight('white'), new Bishop('white'), new Queen('white'), new King('white'), new Bishop('white'), new Knight('white'), new Rook('white')
        ];
    }
    createFlippedPieces(){
        const flipBoard= [];
        for(let piece= this.boardPieces.length-1; piece>= 0; piece--){
            flipBoard.push(this.boardPieces[piece]);
        }
        return flipBoard;
    }
    addSquares(){
        const squares= [];
        for(let i= 0; i<= 63; i++){
            const square = document.createElement('div');
            square.setAttribute('data-index', i);
            square.classList.add('square');
            this.boardDiv.appendChild(square);
            squares.push(square);
        }
        return squares;
    }
    renderBoard(){ 
        //add colors and pieces etc
        this.boardPieces.forEach((piece, idx) => {

            const square= this.squares[idx];
            square.innerHTML= '';

            const row = Math.floor((63 - idx) / 8) + 1;
            if(row % 2 === 0){ // changes the color of the square based on the row and column
                square.classList.add(idx % 2 == 0 ? 'light' : 'dark');
            } else {
                square.classList.add(idx % 2 == 0 ? 'dark' : 'light');
            }

            if(piece){
                square.innerHTML = piece.svg;
                square.setAttribute('draggable', piece.color === this.currentPlayer ? 'true' : 'false'); // make pieces draggable
                piece.color === 'white' ? square.firstChild.classList.add('white') : square.firstChild.classList.add('black');
            } else {
                square.setAttribute('draggable', 'false');
            }

        });

    }
    
    updateDraggables(){
        const squares= document.querySelectorAll('.square')
        squares.forEach(square => {
            square.setAttribute('draggable', square.firstChild ? 'true' : 'false');
        });
    }
    openPannel(){
        this.promotePannel.classList.remove('hidden');
        const options= this.promotePannel.querySelectorAll('button')
        options.forEach(option=>{
            const svg= option.querySelector('.piece');
            svg.classList.add(this.currentPlayer);
        })
    }
    closePannel(){
        this.promotePannel.classList.add('hidden');
    }
    promotionEvents(){
        const options= this.promotePannel.querySelectorAll('button')
        options.forEach(option=>{
            option.addEventListener('click', ()=>{
                
                if(!this.promotionInfo) return;

                const target=  this.boardDiv[this.promotionInfo.targetIdx];
                const currentColor= this.currentPlayer== 'white'? 'black': 'white';
                this.promotionInfo.piece= option.dataset.piece;                
                
                if(this.promotionInfo.piece== 'queen'){
                    this.boardPieces[this.promotionInfo.targetIdx]= new Queen(currentColor);
                    target.innerHTML= option.innerHTML;
                }else if(this.promotionInfo.piece== 'rook'){
                    this.boardPieces[this.promotionInfo.targetIdx]= new Rook(currentColor);
                    target.innerHTML= option.innerHTML;
                }else if(this.promotionInfo.piece== 'bishop'){
                    this.boardPieces[this.promotionInfo.targetIdx]= new Bishop(currentColor);
                    target.innerHTML= option.innerHTML;
                }else if(this.promotionInfo.piece== 'knight'){
                    this.boardPieces[this.promotionInfo.targetIdx]= new Knight(currentColor);
                    target.innerHTML= option.innerHTML;
                }
                this.closePannel();
                let check = Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer); //return pice that checked
                console.log(check)
                if (check.at) this.markCheck(check);
                this.promotionInfo= null;
            });
        })
    }
    
    clearClickSelection(){
        
        this.activeMoveHandlers.forEach(({ element, handler }) => {
            element.removeEventListener('click', handler);
        });
        this.activeMoveHandlers = [];
        // this.activeClickValidMoves.forEach(i => {
        //     if(this.boardDiv[i]) {
        //         this.boardDiv[i].classList.remove('drop-target');
        //         this.boardDiv[i].classList.remove('castle');
        //     }
        // });
        // this.activeClickTakeMoves.forEach(i => {
        //     if(this.boardDiv[i]){
        //         this.boardDiv[i].classList.remove('capture-target');
        //     }
        // });
        // this.activeClickValidMoves = [];
        // this.activeClickTakeMoves = [];
    }
    clearMsg(){
        this.status.innerText= '';
        this.gameMsg.innerText= ``
    }
    fillGameMsg(status, msg){
        this.status.innerText= status;
        this.gameMsg.innerText= msg;
    }
    fillMsg(msg){
        this.gameMsg.innerText= msg;
    }
    changeTurn(){
        if(this.currentPlayer === 'white'){
            this.currentPlayer = 'black';
            this.player.innerText= 'Black';
            if(this.checked)
                if(this.isCheckMate()){
                    console.log('checkMAte');
                    squares.forEach((square, i) => square.setAttribute('draggable', 'false'))
                    return;
                }
             
            this.squares.forEach((square, i) => {
                square.setAttribute('draggable', this.boardPieces[i] && this.boardPieces[i].color === 'black' ? 'true' : 'false');
            })
        
        }else{
            this.currentPlayer = 'white';
            this.player.innerText= 'White';
            if(this.checked)
                if(this.isCheckMate()){
                    squares.forEach((square, i) => square.setAttribute('draggable', 'false'))
                    return;
                }
            this.squares.forEach((square, i) => {
                square.setAttribute('draggable', this.boardPieces[i] && this.boardPieces[i].color === 'white' ? 'true' : 'false');
            })
        }
    }
    canCastle(king){
        let whiteRook= [56, 63];
        let blackRook= [0, 7];
        let rookIdxes= [];
        let kingIdx= this.boardPieces.indexOf(king);
        let rook;
        let empSqrs= [];

        const checkEmptySqrs= ()=>{
            rookIdxes.some(idx=>{
                let allow= true;
                let sqrs= Piece.prototype.getPathBetween(kingIdx, idx)
                if(idx> kingIdx){ //king side
                    sqrs.some(sq=>{
                        if(this.boardPieces[sq]) { allow= false; return true }
                    })
                    if(allow) this.castleInfo.kingSide= sqrs;
                }
                else {//queenside
                    sqrs.some(sq=>{
                        if(this.boardPieces[sq]) {allow= false; return true}
                    })
                    if(allow) this.castleInfo.queenSide= sqrs;
                }
    
            })
        }
        const checkSafety= (moves)=>{
            console.log('king side moves', moves)
            let save= true;
            this.boardPieces.some((piece, cP)=>{
                if(piece? piece.color== this.currentPlayer : true) return;
                save= true;
                let temp= piece.validMove(cP, this.boardPieces);
                moves.some(move=> {
                    if(temp.includes(move)){
                        save= false;
                        console.log(piece.piece, ' targets at ', move)
                        return true;
                    }
                })
                if(!save) return true;
            })
            if(save) return true;
            else return false;
        }
        const editKingMoves= (move)=> {
            king.targetPositions.push(move);
            this.activeClickValidMoves.push(move);
        }
        
        rookIdxes= this.currentPlayer== 'white'? whiteRook: blackRook;

        rookIdxes = rookIdxes.filter(idx => this.boardPieces[idx]? !this.boardPieces[idx].movedbefore: false);
        if(rookIdxes.length== 0) return false; //if both rooks moved
        
        checkEmptySqrs(); //check for queen or king side

        //check each square to know if it under attack
        if(this.castleInfo.kingSide.length != 0){
            if(checkSafety(this.castleInfo.kingSide)) {
                editKingMoves(kingIdx+ 2)
                this.castleInfo.kingSide= [kingIdx+ 2]
            }
            else this.castleInfo.kingSide= []; //cant castle
        }
        if(this.castleInfo.queenSide.length != 0){
            if(checkSafety(this.castleInfo.queenSide)) {
                editKingMoves(kingIdx- 2)
                this.castleInfo.queenSide= [kingIdx- 2]
            }
            else this.castleInfo.queenSide= []; //cant castle
        }
        
        if(this.castleInfo.kingSide.length!= 0 || this.castleInfo.queenSide.length!= 0) 
            this.castleInfo.can= true;
        
    }
    castle(king, target){
        console.log('in castle')
        let kingIdx = Number(king.dataset.index);
        let targetIndex = Number(target.dataset.index);

        this.boardPieces[targetIndex]= this.boardPieces[kingIdx]
        this.boardPieces[targetIndex].movedbefore= true;
        this.boardDiv[targetIndex].innerHTML= this.boardDiv[kingIdx].innerHTML;
        this.boardDiv[kingIdx].innerHTML= null;
        this.boardPieces[kingIdx]= null;

        if(kingIdx < targetIndex){ //kingside
            if(this.currentPlayer== 'white'){
                this.boardPieces[targetIndex-1]= this.boardPieces[63] 
                this.boardPieces[targetIndex-1].movedbefore= true;
                this.boardDiv[targetIndex-1].innerHTML= this.boardDiv[63].innerHTML;
                this.boardDiv[63].innerHTML= null;
                this.boardPieces[63]= null;
            }else{
                this.boardPieces[targetIndex-1]= this.boardPieces[7] 
                this.boardPieces[targetIndex-1].movedbefore= true;
                this.boardDiv[targetIndex-1].innerHTML= this.boardDiv[63].innerHTML;
                this.boardDiv[7].innerHTML= null;
                this.boardPieces[7]= null;
            }
        }else{ //queen side
            if(this.currentPlayer== 'white'){
                this.boardPieces[targetIndex+ 1]= this.boardPieces[56]
                this.boardPieces[targetIndex+ 1].movedbefore= true;
                this.boardDiv[targetIndex+ 1].innerHTML= this.boardDiv[56].innerHTML;
                this.boardDiv[56].innerHTML= null;
                this.boardPieces[56]= null;
            }else {
                this.boardPieces[targetIndex+ 1]= this.boardPieces[0]
                this.boardPieces[targetIndex+ 1].movedbefore= true;
                this.boardDiv[targetIndex+ 1].innerHTML= this.boardDiv[0].innerHTML;
                this.boardDiv[0].innerHTML= null;
                this.boardPieces[0]= null;
            }
        }
        this.updateDraggables();
        this.clearClickSelection();
        this.castleInfo= {
            can: false,
            kingSide: [],
            queenSide: []
        }

    }

    movePiece = (source, target) => {
            const sourceIndex = Number(source.dataset.index);
            const targetIndex = Number(target.dataset.index);
            this.boardPieces[targetIndex] = this.boardPieces[sourceIndex];
            this.boardPieces[sourceIndex] = null;
            target.innerHTML = this.selectedSquare.innerHTML;
            source.innerHTML = '';
            if (!this.boardPieces[targetIndex].movedbefore)
                this.boardPieces[targetIndex].movedbefore = true;
            this.updateDraggables();
            this.clearClickSelection();
            //check for check
            if(!this.checked){
                //check for check
                let check = Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer== 'white'? 'black':'white'); //return pice that checked
                if (check.at) this.markCheck(check);
            }else this.removeCheck();
            if(this.boardPieces[targetIndex].piece== 'pawn' && ((targetIndex>= 0 && targetIndex<= 7))){
                this.promotionInfo= {
                    sourceIdx: sourceIndex,
                    targetIdx: targetIndex,
                    piece: null //promote to piece
                }
                this.openPannel();
            }
    };
    
    markCheck(check){
        this.boardDiv[check.at].classList.add('check');
        this.checked= true;
        this.check.at= check.at;
        this.check.by= check.by;
        this.status.innerText= 'Check!'
    }
    removeCheck(){
        this.boardDiv[this.check.at].classList.remove('check');
        this.checked= false;
        this.check.at= null;
        this.check.by= null;
        // Reset checkmate flags
        this.chckMate = {
            escape: false,
            block: false,
            capture: false
        };
        this.gameMsg.innerText= ''
        this.status.innerText= ''
    }
    
    isCheckMate(){
        
        let block= false; //cannot block
        let capture= false; //cannot capture
        let validMoves= []; //of piece
        let takeMoves= [];
        //get squares where check can block
        const blockPositions = Piece.prototype.findBlockPositions(this.check, this.boardPieces);
        if(blockPositions.length== 0) this.chckMate.block= false;
        const checkPos = this.boardPieces.indexOf(this.check.by[0]);

        const canBlock= ()=>{
            blockPositions.some(pos=> {
                if(validMoves.includes(pos)){
                    block= true;
                    this.chckMate.block= true;
                    return true;
                }
            })
        }
        const canCapture= ()=>{
            if(takeMoves.includes(checkPos)){
                capture= true;
                this.chckMate.capture= true;
            }
        }

        //handle capture and block
        this.boardPieces.some((chessPiece, i)=>{
            if(chessPiece? chessPiece.color!= this.currentPlayer || chessPiece.piece== 'king' : true) return;
            validMoves = chessPiece.validMove(i, this.boardPieces); 
            takeMoves= chessPiece.takeMove(i, this.boardPieces);
            if(validMoves.length== 0) return false;
            if(!block && blockPositions.length!= 0) canBlock(); 
            if(!capture) canCapture();
            if(block && capture) return true;

        })
        const king= this.boardPieces[this.check.at];
        if(king.validMove(this.boardPieces.indexOf(king), this.boardPieces) != 0){
            this.chckMate.escape= true;
        } 
        if(!this.chckMate.block && !this.chckMate.capture && !this.chckMate.escape) return true;

        return false;

    }
    
    selectPiece(block) {
        this.clearClickSelection();
        this.selectedSquare = block;
        this.selectedIndex= Number(this.selectedSquare.dataset.index)
        this.selectedPiece= this.boardPieces[this.selectedIndex];
        this.selectedSquare.classList.add('dragging');
    }
    isPinned() {
        let saveMoves= [];

        //gets valid moves of piece
        let validMoves= this.selectedPiece.validMove(this.selectedIndex, this.boardPieces)
        
        //if it has no moves
        if(validMoves== 0) return false;

        //internally placing that piece over its valid moves and filter those moves which are save
        validMoves.forEach(move => {
            
            let orgPiece = this.boardPieces[move]; 
            this.boardPieces[move] = this.selectedPiece;
            this.boardPieces[this.selectedIndex]= null;
            
            //return pieces that check king
            let check = Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer);
            if (check.at && check.by.length > 0 && check.by[0].color !== this.currentPlayer) {
                this.boardPieces[move]= orgPiece;
                return;
            }else{
                saveMoves.push(move);
                this.boardPieces[move]= orgPiece;
                return;
            }

        })
        this.boardPieces[this.selectedIndex]= this.selectedPiece;
        
        //if no save move
        if(saveMoves.length== 0){
            
            // this.activeClickValidMoves= saveMoves;
            // internalPiece.validMoves= this.activeClickValidMoves;
            // this.activeClickTakeMoves = []; // it can capture, its pinned
            return true;
        }else{
            this.activeClickValidMoves= saveMoves;
            this.selectedPiece.targetPositions= this.activeClickValidMoves;
            // this.activeClickTakeMoves = internalPiece.takeMove(currentPosition, this.boardPieces);
            return false;
        }
    }
    checkPin(){
        if (this.selectedPiece.piece !== 'king' && !this.checked) {
            if (this.isPinned()) {
                this.pinned= true;
                this.selectedSquare.classList.add('bind');
                this.fillGameMsg('Pinned!', `Moving this ${internalPiece.piece} will lead to expose check!`)
                return true;
            }else {
                //valid moves already set
                this.pinned= false;
                this.clearMsg();
                return false;
            }
        }
    }
        
    moveablePiece(){
        
        let validMoves = this.selectedPiece.validMove(this.selectedIndex, this.boardPieces);
        if(validMoves== 0) return false;

        //pos of who checks
        let checkPos = this.boardPieces.indexOf(this.check.by[0]);
        let blockPositions = Piece.prototype.findBlockPositions(this.check, this.boardPieces);
   

    }
        // // When in check and selecting non-king piece
        // if (this.checked && internalPiece.piece !== 'king') {
            
        //     // Get all valid moves for the piece
                
        //     // Filter to only capture of checking piece or block moves
        //     // by [0] cuz we can capture when only single piece checks us
                 
        //     this.activeClickValidMoves = validMoves.filter(move => 
        //         move === checkPos || blockPositions.includes(move)
        //     );
        //     internalPiece.targetPositions= this.activeClickValidMoves; 

        //     if(this.activeClickValidMoves.length== 0) this.fillMsg(`Can't move this ${internalPiece.piece} in check!`);
        //     else this.fillMsg(`This ${internalPiece.piece} can only block check!`);
            
        //     this.activeClickTakeMoves = this.activeClickValidMoves.filter(move => move === checkPos);
        //     if(this.activeClickTakeMoves.length != 0) this.fillMsg(`This ${internalPiece.piece} can only capture ${this.check.by[0].piece}!`);
        //     internalPiece.takePositions= this.activeClickTakeMoves;
            
        // } else {
        //     // Normal piece selection (king or not in check)
        //     this.activeClickValidMoves = internalPiece.validMove(
        //         Number(this.selectedSquare.dataset.index), 
        //         this.boardPieces
        //     );
        //     this.activeClickTakeMoves = internalPiece.takeMove(
        //         Number(this.selectedSquare.dataset.index), 
        //         this.boardPieces
        //     );
        //     //adding castle moves
        //     if(internalPiece.piece== 'king' && !internalPiece.movedbefore && !this.checked){
        //         this.canCastle(internalPiece);
        //     }
        //     if(internalPiece.piece== 'king' && this.checked) this.fillGameMsg('', 'Can\'t castle! you are in check!');

        //     internalPiece.targetPositions= this.activeClickValidMoves; 
        //     internalPiece.takePositions= this.activeClickTakeMoves;

        // }
        

    
    dragAndDropFunctionality(){
        let draggedHtml = null;
        let castleSqr= null;
        const squares = document.querySelectorAll('.square');
        squares.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                
                if (block.getAttribute('draggable') !== 'true') return;
                
                this.selectPiece(block);
                
                if (this.activeClickValidMoves.length === 0)
                    return;
                
                draggedHtml = block.innerHTML;
                
                this.activeClickValidMoves.forEach((moveIndex) => {
                    const targetSquare = this.boardDiv[moveIndex];
                    if (this.activeClickTakeMoves.includes(moveIndex)) {
                        targetSquare.classList.add("capture-target");
                    } else if(this.castleInfo.kingSide.includes(moveIndex) || this.castleInfo.queenSide.includes(moveIndex)){
                        castleSqr= targetSquare;
                        castleSqr.classList.add("castle");
                    }
                    else 
                        targetSquare.classList.add("drop-target");
                });
               
                e.dataTransfer.setData('text/plain', this.selectedSquare.dataset.index);
                e.dataTransfer.effectAllowed = 'move';               
                
            });

            block.addEventListener('dragend', () => {
                this.clearClickSelection();
                this.clearMsg();
            });

            block.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (this.selectedSquare && this.activeClickValidMoves.includes(Number(block.dataset.index))== false && block !== this.selectedSquare) {
                    block.classList.add('wrong-drop-target');
                }
            });

            block.addEventListener('dragleave', () => {
                block.classList.remove('wrong-drop-target');

            });

            block.addEventListener('drop', (e) => {
                e.preventDefault();
                if(!this.activeClickValidMoves.includes(Number(block.dataset.index))) {
                    block.classList.remove('wrong-drop-target');
                    return;
                }
                if(castleSqr== block && castleSqr!= null){
                    this.castle(this.selectedSquare, block);
                }else
                    this.movePiece(this.selectedSquare, block);
                this.changeTurn();
            });
        });
    }

    clickFunctionality(){
       
        this.squares.forEach(square => {
            square.addEventListener('click', ()=>{

                if(square.getAttribute('draggable') == 'false' && !this.selectedSquare) return;
                // If a piece is already selected
                if(this.selectedSquare){
                    // If clicking the selected square again, deselect
                    if(square === this.selectedSquare){ 
                        clearSelection();
                        if(!this.checked) this.clearMsg()
                        return;
                    }
                    //if click any draggable square, replace
                    if(square.getAttribute('draggable') === 'true'){
                        clearSelection()
                        this.selectedSquare= square;
                        selectPiece(square);  
                        return;
                    }
                    // If capture square
                    if(this.activeClickValidMoves.includes(Number(square.dataset.index))  ){
                        return;
                    }
                    if(square.getAttribute('draggable') === 'false'){
                        clearSelection();
                        if(!this.checked) this.clearMsg()
                        return;
                    }
                    
                    // Valid move will be handled by the handler added to the square
                }else {
                    // Select the piece
                    selectPiece(square);
                }
            });
        });
        const selectPiece = (square) => {

            let castleSqr= null;
            this.selectPiece(square) //set selected sq etc

            if(this.checkPin()){
                console.log('pinned');
                return;
            }

            if(this.checked && this.selectedPiece.piece!= 'king'){
                this.moveablePiece();
            }
            
            
            // Add drop-target class and handlers to valid moves
            this.activeClickValidMoves.forEach((moveIndex) => {
                const targetSquare = this.boardDiv[moveIndex];
                if (this.activeClickTakeMoves.includes(moveIndex)) {
                    targetSquare.classList.add("capture-target");
                }
                else if(this.castleInfo.kingSide.includes(moveIndex) || this.castleInfo.queenSide.includes(moveIndex)){
                    castleSqr= targetSquare;
                    castleSqr.classList.add("castle");
                }
                else 
                    targetSquare.classList.add("drop-target");
                
                if(castleSqr){
                    const handler = () => {
                        this.castle(this.selectedSquare, targetSquare);
                        this.fillGameMsg('Castled!', `${this.currentPlayer} has castled`);
                        this.changeTurn();
                    }
                    castleSqr.addEventListener("click", handler);
                    this.activeMoveHandlers.push({ element: castleSqr, handler });
                    this.fillGameMsg('', 'You can Castle');
                }else{
                    const handler = () => {
                        this.movePiece(this.selectedSquare, targetSquare);
                        this.changeTurn();
                    }
                    targetSquare.addEventListener("click", handler);
                    this.activeMoveHandlers.push({ element: targetSquare, handler });
                }
                
          });
        };

        const clearSelection = () => {
            this.clearClickSelection();
        };
    }

    
}
window.addEventListener('load', () => {
    const board = document.getElementById('board');
    const displayPlayer = document.getElementById('player');
    const chessBoard = new gameBoard(board);
    chessBoard.promotionEvents();
    chessBoard.renderBoard();
    //chessBoard.reverseIndex();
    chessBoard.dragAndDropFunctionality();
    chessBoard.clickFunctionality();

})
