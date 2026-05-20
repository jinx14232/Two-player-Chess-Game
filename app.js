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
            kingSide: {rookMoved: false, save: false, kingIdx: null, rookIdx: null}, 
            queenSide: {rookMoved: false, save: false, kingIdx: null, rookIdx: null}
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
    flipPieces(){
        const flipBoard= [];
        for(let piece= this.boardPieces.length-1; piece>= 0; piece--){
            flipBoard.push(this.boardPieces[piece]);
        }
        this.boardPieces= flipBoard;
        console.log(this.boardPieces);
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
            this.flipPieces();
            this.renderBoard();
           
        
        }else{
            this.currentPlayer = 'white';
            this.player.innerText= 'White';
            this.flipPieces();
            this.renderBoard();

        }
    }
    
    kingChecks(piece){
        const targetColor= piece.color== 'white'? 'black': 'white';
        const validMoves= piece.takeMove(this.boardPieces.indexOf(piece), this.boardPieces);
        const kingIdx= null;

        this.boardPieces.some((p, idx)=> {
            if(p? p.piece=='king' && piece.color== targetColor: false){
                kingIdx= idx;
                return true;
            } 
        });
        
        if(validMoves.includes(kingIdx)){
            this.check.at= kingIdx;
            this.check.by.push(piece);
            return true;
        } 
        else return false;

    }

    movePiece = (source, target) => {
            const sourceIndex = Number(source.dataset.index);
            const targetIndex = Number(target.dataset.index);
            const movingPiece = this.boardPieces[sourceIndex];

            this.boardPieces[targetIndex] = movingPiece;
            this.boardPieces[sourceIndex] = null;

            target.innerHTML = source.innerHTML;
            source.innerHTML = '';

            if (!this.boardPieces[targetIndex].movedbefore)
                this.boardPieces[targetIndex].movedbefore = true;
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
        this.activeClickValidMoves= this.selectedPiece.validMove(this.selectedIndex, this.boardPieces);
        this.activeClickTakeMoves= this.selectedPiece.takeMove(this.selectedIndex, this.boardPieces);

    }

    isPinned() {
        
        //if it has no moves
        if(this.activeClickValidMoves.length == 0) return false;

        //internally placing that piece over its valid moves and filter those moves which are save
        this.activeClickValidMoves= this.activeClickValidMoves.filter(move => {
            
            let orgPiece = this.boardPieces[move]; 
            this.boardPieces[move] = this.selectedPiece;
            this.boardPieces[this.selectedIndex]= null;
            
            //return pieces that check king
            let check = Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer);
            if (check.at && check.by.length > 0 && check.by[0].color !== this.currentPlayer) {
                this.boardPieces[move]= orgPiece;
                return false; //move is not save, it exposes check
            }else{
                this.boardPieces[move]= orgPiece;
                return true; //move is save, it doesn't expose check
            }

        })
        this.boardPieces[this.selectedIndex]= this.selectedPiece;
        
        //if no save move
        if(this.activeClickValidMoves.length== 0){
            return true; //pinned, all moves expose check
        }else{
            return false; //not pinned, has some moves that dont expose check
        }
    }
    checkPin(){
        if (this.selectedPiece.piece !== 'king' && !this.checked) {
            if (this.isPinned()) {
                //active moves already filtered in isPinned, so no need to do anything here
                this.pinned= true;
                this.selectedSquare.classList.add('bind');
                this.fillGameMsg('Pinned!', `Moving this ${internalPiece.piece} will lead to expose check!`)
                return true;
            }else {
                // If not pinned, or if some active moves are filtered because they expose check, we need to update the valid moves and take moves for the selected piece 
                this.selectedPiece.targetPositions= this.activeClickValidMoves;
                this.activeClickTakeMoves= this.selectedPiece.takeMove(this.selectedIndex, this.boardPieces);

                this.pinned= false;
                this.clearMsg();
                return false;
            }
        }
    }   
    captureChecker(){
        
        if(this.activeClickTakeMoves.length== 0) return false;

        //pos of who checks
        let checkPos = this.boardPieces.indexOf(this.check.by[0]);
        
        if(this.activeClickTakeMoves.includes(checkPos)) return checkPos;
        else return null;

    }
    blockCheckerPos(){

        if(this.activeClickValidMoves.length== 0) return null;
        
        let blockPositions = Piece.prototype.findBlockPositions(this.check, this.boardPieces);
        if(blockPositions.length== 0) return null;

        this.activeClickValidMoves = this.activeClickValidMoves.filter(move => 
            blockPositions.includes(move)
        );

        if(this.activeClickValidMoves.length== 0) return null;
        
    }

    rookStatus(rookIdx){

        //check if rooks are in position and not moved before
        if( this.boardPieces[rookIdx]? this.boardPieces[rookIdx].piece !== 'rook' || this.boardPieces[rookIdx].color !== this.currentPlayer || this.boardPieces[rookIdx].movedbefore : true) 
            return false;

        return true; 

    }
    checkEmptySquares(rookIdx){

        const kingIdx= this.selectedIndex;
        const path= Piece.prototype.getPathBetween(kingIdx, rookIdx);
        let emptySqrs= [];
        
        emptySqrs= path.filter(sq=>{
            if(this.boardPieces[sq]) return false;
            else return true;
        })

        //if no empty squares
        if(emptySqrs.length== 0) return false;

        //checking if any empty square is attacked
        let allow= true;
        this.boardPieces.some(piece=>{
            if(!piece || piece.color== this.currentPlayer) return;
            let validMoves= piece.validMove(this.boardPieces.indexOf(piece), this.boardPieces);
            validMoves.some(move=>{
                if(emptySqrs.includes(move)){
                    allow= false;
                    return true;
                }
            })
            if(!allow) return true;
        })

        return allow;    
    }

    clearMovesFormatting(){
        this.selectedSquare.classList.remove('dragging');
        this.activeClickTakeMoves.forEach(pos=> this.squares[pos].classList.remove('capture-target'))
        this.activeClickValidMoves.forEach(pos=> this.squares[pos].classList.remove('drop-target'))
        
        if(this.castleInfo.kingSide.save){
            this.squares[this.castleInfo.kingSide.kingIdx].classList.remove('castle');
        }
        if(this.castleInfo.queenSide.save){
            this.squares[this.castleInfo.queenSide.kingIdx].classList.remove('castle');
        }

    }

    clearSelections(){

        this.activeClickTakeMoves= [];
        this.activeClickValidMoves= [];
        this.selectedPiece.takePositions= [];
        this.selectedPiece.targetPositions= [];

        this.selectedPiece= null;
        this.selectedSquare= null;
        this.selectedIndex= null;

    }
    clearSelection= ()=>{
            this.clearMovesFormatting();
            this.clearSelections();
            this.clearClickSelection();
    }

    castle(king, target){
        console.log('castle square', target)
        let kingIdx = Number(king.dataset.index);
        let targetIndex = Number(target.dataset.index);

        this.boardPieces[targetIndex]= this.boardPieces[kingIdx]
        this.boardPieces[targetIndex].movedbefore= true;
        
        target.innerHTML= king.innerHTML;
        king.innerHTML= null;
        
        this.boardPieces[kingIdx]= null;
        kingIdx= targetIndex;

        if(this.castleInfo.kingSide.kingIdx === kingIdx){ //kingside
            const rookIdx= this.currentPlayer== 'white'? 63: 56;
            console.log('castling king side', rookIdx, this.castleInfo.kingSide.rookIdx)

            this.boardPieces[rookIdx].movedbefore= true;
            this.boardPieces[this.castleInfo.kingSide.rookIdx]= this.boardPieces[rookIdx];

            this.squares[this.castleInfo.kingSide.rookIdx].innerHTML= this.squares[rookIdx].innerHTML;
            this.squares[rookIdx].innerHTML= null;

            this.boardPieces[rookIdx]= null;

        }else{ //queen side
            const rookIdx= this.currentPlayer== 'white'? 56: 63;
            this.boardPieces[rookIdx].movedbefore= true;
            this.boardPieces[this.castleInfo.queenSide.rookIdx]= this.boardPieces[rookIdx];
           
            this.squares[this.castleInfo.queenSide.rookIdx].innerHTML= this.squares[rookIdx].innerHTML;
            this.squares[rookIdx].innerHTML= null;
            
            this.boardPieces[rookIdx]= null;
        }
        console.log('castled ',this.boardPieces)

    }
    
    checkBind(){
        if (!this.checked && this.selectedPiece.piece!= 'king') {
            if (this.checkPin()) {
                console.log("pinned");
                this.clearSelection();
                return true; //pinned, all moves expose check
            }
              // if not pinned, valid and take moves are initialized
        }
        return false;
    }
    captureOrBlock(){
        if(this.checked && this.selectedPiece.piece!= 'king'){
                //check if piece can capture checker
                const checkerPos= this.captureChecker();
                if(checkerPos!= null){

                    //if it can capture checker, then we only show that move and hide all other moves, because capturing is the only way to get out of check for non king pieces
                    this.activeClickTakeMoves=[checkerPos];
                    this.activeClickValidMoves=[checkerPos];
                    this.selectedPiece.targetPositions=[checkerPos];
                    this.selectedPiece.takePositions=[checkerPos];
                
                }
                //check if piece can block checker
                if(this.blockCheckerPos()){
                    //if not null, then some valid moves are filtered that can block the check, so we show those moves and hide other moves, because blocking and capturing are only required
                    this.selectedPiece.targetPositions= this.activeClickValidMoves;
                }
            }
    }
    addCastleMoves(){
        if(this.selectedPiece.piece== 'king'){
                
                if(!this.selectedPiece.movedbefore && !this.checked){
                    console.log('checking castle')

                    //king side rook
                    this.castleInfo.kingSide.rookMoved= this.rookStatus(this.currentPlayer== 'white'? 63: 56)? false: true;

                    //queen side rook
                    this.castleInfo.queenSide.rookMoved= this.rookStatus(this.currentPlayer== 'white'? 56: 63)? false: true; 
                    
                    //if kingside rook is not moved and empty squares between king and rook and those squares are not attacked, then can castle king side
                    this.castleInfo.kingSide.save= this.checkEmptySquares(this.currentPlayer== 'white'? 63: 56);
                    if(!this.castleInfo.kingSide.rookMoved && this.castleInfo.kingSide.save){
                        this.castleInfo.kingSide.kingIdx= this.currentPlayer== 'white'? 62: 57;
                        this.castleInfo.kingSide.rookIdx= this.currentPlayer== 'white'? 61: 58;
                        this.activeClickValidMoves.push(this.castleInfo.kingSide.kingIdx);
                    }
                    //if queenside rook is not moved and empty squares between king and rook and those squares are not attacked, then can castle queen side
                    this.castleInfo.queenSide.save= this.checkEmptySquares(this.currentPlayer== 'white'? 56: 63);
                    if(!this.castleInfo.queenSide.rookMoved && this.castleInfo.queenSide.save){
                        this.castleInfo.queenSide.kingIdx= this.currentPlayer== 'white'? 58: 61;
                        this.castleInfo.queenSide.rookIdx= this.currentPlayer== 'white'? 59: 60;
                        this.activeClickValidMoves.push(this.castleInfo.queenSide.kingIdx);
                    }
                    console.log(this.castleInfo);

                }
            }
    }

    dragAndDropFunctionality(){
       let castleSqr= null;
        this.squares.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                
                if (block.getAttribute('draggable') == 'false') return;
                
                this.selectPiece(block);
                if (this.checkBind()) return; //if pinned, return and dont show any moves
                this.captureOrBlock(); 
                this.addCastleMoves();

                if (this.activeClickValidMoves.length === 0 && this.activeClickTakeMoves.length === 0)
                    return;
                
                this.activeClickValidMoves.forEach((moveIndex) => {
                    const targetSquare = this.squares[moveIndex];
                    if (this.activeClickTakeMoves.includes(moveIndex)) {
                        targetSquare.classList.add("capture-target");
                    } else if(this.selectedPiece.piece== 'king' && (this.castleInfo.kingSide.kingIdx== moveIndex || this.castleInfo.queenSide.kingIdx== moveIndex)){
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
                console.log('drag end')
                this.clearSelection();
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
 console.log('drop')
                //if drop on invalid square, do nothing
                if(!this.activeClickValidMoves.includes(Number(block.dataset.index))) {
                    block.classList.remove('wrong-drop-target');
                    //this.clearSelection();
                    return;
                }

                if(castleSqr== block && castleSqr!= null)
                    this.castle(this.selectedSquare, castleSqr);
                else
                    this.movePiece(this.selectedSquare, block);

                if(this.kingChecks(this.selectedPiece)) this.markCheck(this.check);
                //this.clearSelection();
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
                    if(square === this.selectedSquare ){ 
                        this.clearSelection();
                        if(!this.checked) this.clearMsg()
                        return;
                    }
                    //if click any draggable square, replace
                    if(square.getAttribute('draggable') === 'true'){
                        clearSelection();
                        selectPiece(square);  
                        return;
                    }
                    // If capture square
                    if(this.activeClickValidMoves.includes(Number(square.dataset.index))){
                        console.log('take move')
                        return;
                    }
                    if(square.getAttribute('draggable') === 'false'){
                        clearSelection();
                        return;
                    }
                    
                }else {
                    // Select the piece
                    selectPiece(square);
                }
            });
        });
        const selectPiece = (square) => {

            let castleSqr= null;

            this.selectPiece(square) //set selected sq etc
            
            if (this.checkBind()) return; //if pinned, return and dont show any moves
            this.captureOrBlock(); 
            this.addCastleMoves();

            if(this.activeClickTakeMoves.length== 0 && this.activeClickValidMoves.length== 0) return;
            
            console.log(this.activeClickValidMoves, this.activeClickTakeMoves)
            // Add drop-target class and handlers to valid moves
            this.activeClickValidMoves.forEach((moveIndex) => {
                const targetSquare = this.squares[moveIndex];
                if (this.activeClickTakeMoves.includes(moveIndex)) {
                    targetSquare.classList.add("capture-target");
                }
                else if(this.selectedPiece.piece== 'king' && (this.castleInfo.kingSide.kingIdx== moveIndex || this.castleInfo.queenSide.kingIdx== moveIndex)){
                    castleSqr= targetSquare;
                    castleSqr.classList.add("castle");
                }
                else 
                    targetSquare.classList.add("drop-target");
                
                if(castleSqr){
                    const handler = () => {
                        this.castle(this.selectedSquare, castleSqr);
                        if(this.kingChecks(this.selectedPiece)) this.markCheck(this.check);
                        this.clearSelection();
                        this.fillGameMsg('Castled!', `${this.currentPlayer} has castled`);
                        this.changeTurn();
                    }
                    castleSqr.addEventListener("click", handler);
                    this.activeMoveHandlers.push({ element: castleSqr, handler });
                    this.fillGameMsg('', 'You can Castle');
                }else{

                    const handler = () => {
                        this.movePiece(this.selectedSquare, targetSquare);
                        if(this.kingChecks(this.selectedPiece)) this.markCheck(this.check);
                        this.clearSelection();
                        this.changeTurn();
                    }
                    targetSquare.addEventListener("click", handler);
                    this.activeMoveHandlers.push({ element: targetSquare, handler });
                }
                
          });
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
