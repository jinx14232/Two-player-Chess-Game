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
        if(this.check.at != null){
            this.clearCheckFormatting();
            this.check.at= flipBoard.indexOf(this.boardPieces[this.check.at]);
            this.markCheck(this.check);
        }
        this.boardPieces= flipBoard;
    }
    
    renderBoard(){ 
        //add colors and pieces etc
        this.boardPieces.forEach((piece, idx) => {

            const square= this.squares[idx];
            square.innerHTML= '';
            square.className = 'square';

            const row = Math.floor((63 - idx) / 8) + 1;
            if(row % 2 === 0){ // changes the color of the square based on the row and column
                square.classList.add(idx % 2 == 0 ? 'light' : 'dark');
            } else {
                square.classList.add(idx % 2 == 0 ? 'dark' : 'light');
            }

            if(piece){
                 square.innerHTML = piece.svg;

                // piece.color== this.currentPlayer? square.innerHTML = piece.currentImg : square.innerHTML = piece.svg;
                square.setAttribute('draggable', piece.color === this.currentPlayer ? 'true' : 'false'); // make pieces draggable
                piece.color === 'white' ? square.firstChild.classList.add('white') : square.firstChild.classList.add('black');
            } else {
                square.setAttribute('draggable', 'false');
            }

        });

        if(this.checked && this.check.at != null){
            this.squares[this.check.at].classList.add('check');
        }

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

                const target= this.squares[this.promotionInfo.targetIdx];
                const currentColor= this.currentPlayer;
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
                this.fillGameMsg('Promoted', `${currentColor} pawn promoted to ${this.promotionInfo.piece}`);
                this.closePannel();
                this.resetCheck();
                let check = Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer); //return piece that checked
                if (check.at != null) this.markCheck(check);
                this.clearSelection();
                this.changeTurn();
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
    clearMovesFormatting(){
        if(this.selectedSquare){
            this.selectedSquare.classList.remove('dragging');
        }
        this.activeClickTakeMoves.forEach(pos=> this.squares[pos].classList.remove('capture-target'))
        this.activeClickValidMoves.forEach(pos=> this.squares[pos].classList.remove('drop-target'))
        
        if(this.castleInfo.kingSide.save){
            this.squares[this.castleInfo.kingSide.kingIdx].classList.remove('castle');
        }
        if(this.castleInfo.queenSide.save){
            this.squares[this.castleInfo.queenSide.kingIdx].classList.remove('castle');
        }
        if(this.pinned && this.selectedSquare){
            this.selectedSquare.classList.remove('bind');
            this.pinned= false;
        }

    }
    clearSelections(){

        this.activeClickTakeMoves= [];
        this.activeClickValidMoves= [];
        if(this.selectedPiece){
            this.selectedPiece.takePositions= [];
            this.selectedPiece.targetPositions= [];
        }

        this.selectedPiece= null;
        this.selectedSquare= null;
        this.selectedIndex= null;

    }
    clearSelection= ()=>{
            this.clearMovesFormatting();
            this.clearSelections();
            this.clearClickSelection();
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

    resetCastleInfo(){
        this.castleInfo = {
            kingSide: {rookMoved: false, save: false, kingIdx: null, rookIdx: null},
            queenSide: {rookMoved: false, save: false, kingIdx: null, rookIdx: null}
        };
    }

    updateSelectionMessage(){
        if(this.pinned){
            this.fillGameMsg('Pinned!', `Can not move this ${this.selectedPiece.piece}`);
            return;
        }

        if(this.checked){
            if(this.activeClickValidMoves.length === 0 && this.activeClickTakeMoves.length === 0){
                this.fillGameMsg('Check!', `Can not move this ${this.selectedPiece.piece} in check`);
                return;
            }

            const checkerPos = this.boardPieces.indexOf(this.check.by[0]);
            const canCaptureChecker = this.activeClickTakeMoves.includes(checkerPos);
            const blockPositions = Piece.prototype.findBlockPositions(this.check, this.boardPieces);
            const canBlock = blockPositions.some(pos => this.activeClickValidMoves.includes(pos));

            if(canCaptureChecker || canBlock){
                this.fillGameMsg('Check!', 'Only attacker can be captured or block.');
                return;
            }
        }

        if(this.castleInfo.kingSide.save || this.castleInfo.queenSide.save){
            const sides = [];
            if(this.castleInfo.kingSide.save) sides.push('king');
            if(this.castleInfo.queenSide.save) sides.push('queen');
            this.fillGameMsg('', `You can castle on ${sides.join(' or ')} side${sides.length > 1 ? 's' : ''}`);
            return;
        }

        this.clearMsg();
    }

    changeTurn(){
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.player.innerText= this.currentPlayer === 'white' ? 'White' : 'Black';
        this.flipPieces();
        this.renderBoard();
        if(this.checked && this.check.at != null){
            this.squares[this.check.at].classList.add('check');
        }
    }


    
    kingChecks(piece){

        const validMoves= piece.validMove(this.boardPieces.indexOf(piece), this.boardPieces);
        let kingIdx= null;

        this.boardPieces.some((p, idx)=> {
            if(p? p.color== this.currentPlayer || p.piece!= 'king' : true) return false;
            kingIdx= idx;
            return true;
        });
        
        if(validMoves.includes(kingIdx)){
            this.check.at= kingIdx;
            this.check.by= [piece];

            return true;
        } 
        else return false;

    }
    markCheck(check){
        this.squares[check.at].classList.add('check');
        this.checked= true;
        this.check.at= check.at;
        this.check.by= check.by;
        this.status.innerText= 'Check!'
    }
    clearCheckFormatting(){
        if(this.check.at !== null) {
            this.squares[this.check.at].classList.remove('check');
        }
        this.gameMsg.innerText= ''
        this.status.innerText= ''
    }
    resetCheck(){
        this.clearCheckFormatting();
        this.checked= false;
        this.check.at= null;
        this.check.by= [];
        this.chckMate = {
            escape: false,
            block: false,
            capture: false
        };
    }
    isCheckMate(){

        if(this.check.at == null || this.check.by.length == 0) return false;

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
        if(this.check.at == null) return false;
        const king= this.boardPieces[this.check.at];
        if(king && king.validMove(this.boardPieces.indexOf(king), this.boardPieces).length !== 0){
            this.chckMate.escape= true;
        } 
        if(!this.chckMate.block && !this.chckMate.capture && !this.chckMate.escape) return true;

        return false;

    }

    
    selectPiece(block) {

        if(this.selectedSquare) this.clearSelection();
        this.resetCastleInfo();
        this.selectedSquare = block;
        this.selectedIndex= Number(this.selectedSquare.dataset.index)
        this.selectedPiece= this.boardPieces[this.selectedIndex];
        this.selectedSquare.classList.add('dragging');

        this.activeClickValidMoves= this.selectedPiece.validMove(this.selectedIndex, this.boardPieces);
        this.activeClickTakeMoves= this.selectedPiece.takeMove(this.selectedIndex, this.boardPieces);

    }
    movePiece = (source, target) => {
            const sourceIndex = Number(source.dataset.index);
            const targetIndex = Number(target.dataset.index);
            const movingPiece = this.boardPieces[sourceIndex];

            this.boardPieces[targetIndex] = movingPiece;
            this.boardPieces[sourceIndex] = null;

            target.innerHTML = source.innerHTML;
            source.innerHTML = '';

            this.selectedPiece= this.boardPieces[targetIndex]

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


    blockCheckerPos(){        
        let blockPositions = Piece.prototype.findBlockPositions(this.check, this.boardPieces);
        if(blockPositions.length== 0) return null;

        this.activeClickValidMoves = this.activeClickValidMoves.filter(move => 
            blockPositions.includes(move)
        );

        if(this.activeClickValidMoves.length== 0) return null;
        return true;
    }
    rookStatus(rookIdx){

        //check if rooks are in position and not moved before
        if( this.boardPieces[rookIdx]? this.boardPieces[rookIdx].piece == 'rook' && this.boardPieces[rookIdx].color == this.currentPlayer && !this.boardPieces[rookIdx].movedbefore : false) 
            return true;

        return false; 

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
        if(emptySqrs.length!= path.length) return false;

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
    castle(king, target){
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

            this.boardPieces[rookIdx].movedbefore= true;
            this.boardPieces[this.castleInfo.kingSide.rookIdx]= this.boardPieces[rookIdx];

            this.squares[this.castleInfo.kingSide.rookIdx].innerHTML= this.squares[rookIdx].innerHTML;
            this.squares[rookIdx].innerHTML= null;

            this.boardPieces[rookIdx]= null;
            this.selectedPiece= this.boardPieces[rookIdx]

        }else{ //queen side
            const rookIdx= this.currentPlayer== 'white'? 56: 63;
            this.boardPieces[rookIdx].movedbefore= true;
            this.boardPieces[this.castleInfo.queenSide.rookIdx]= this.boardPieces[rookIdx];
           
            this.squares[this.castleInfo.queenSide.rookIdx].innerHTML= this.squares[rookIdx].innerHTML;
            this.squares[rookIdx].innerHTML= null;
            
            this.boardPieces[rookIdx]= null;
            this.selectedPiece= this.boardPieces[rookIdx]
        }
    

    }
    
    checkBind(){
        if (!this.checked && this.selectedPiece.piece!= 'king') {
            if (this.isPinned()) {
                this.pinned= true;
                this.selectedSquare.classList.add('bind');
                this.fillGameMsg('Pinned!', `Can not move this ${this.selectedPiece.piece}`)
                this.clearClickSelection();
                return true; //pinned, all moves expose check
            }else{
                this.selectedPiece.targetPositions= this.activeClickValidMoves;
                this.activeClickTakeMoves= this.selectedPiece.takeMove(this.selectedIndex, this.boardPieces);
                this.clearMsg();
                return false;
            }
              // if not pinned, valid and take moves are initialized
        }
        return false;
    }
    isPinned() {
        
        //if it has no moves
        if(this.activeClickValidMoves.length == 0) return null;

        //internally placing that piece over its valid moves and filter those moves which are save
        this.activeClickValidMoves= this.activeClickValidMoves.filter(move => {
            
            let orgPiece = this.boardPieces[move]; 
            this.boardPieces[move] = this.selectedPiece;
            this.boardPieces[this.selectedIndex]= null;
            
            //return pieces that check king
            let check = Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer);
            if (check.at != null && check.by.length > 0 && check.by[0].color !== this.currentPlayer) {
                this.boardPieces[move]= orgPiece;
                return false; //move is not save, it exposes check
            }else{
                this.boardPieces[move]= orgPiece;
                return move; //move is save, it doesn't expose check
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

    captureOrBlock(){
        if(this.checked && this.selectedPiece.piece!= 'king'){
                //check if piece can capture checker
                
                const checkerPos= this.boardPieces.indexOf(this.check.by[0]);
                const canCaptureChecker = this.activeClickTakeMoves.includes(checkerPos);
                if(canCaptureChecker){
                    //if it can capture checker, then we only show that move and hide all other moves, because capturing is the only way to get out of check for non king pieces
                    this.activeClickTakeMoves=[checkerPos];
                    this.selectedPiece.takePositions=[checkerPos];
                
                }else { //if it cannot capture, then we remove all capture moves, because capturing other pieces is not a valid move when in check, only blocking or capturing the checking piece is valid
                    this.activeClickTakeMoves=[];
                    this.selectedPiece.takePositions=[];
                }
                //check if piece can block checker
                if(this.blockCheckerPos()){
                    if(canCaptureChecker && !this.activeClickValidMoves.includes(checkerPos)){
                        this.activeClickValidMoves.push(checkerPos);
                    }
                    this.selectedPiece.targetPositions= this.activeClickValidMoves;
                }else {
                    this.activeClickValidMoves= this.activeClickTakeMoves;
                    this.selectedPiece.targetPositions= this.activeClickValidMoves;
                }
            }
    }
    addCastleMoves(){

        if (this.selectedPiece.piece == "king") {

          if (!this.selectedPiece.movedbefore && !this.checked) {
            //king side rook
            this.castleInfo.kingSide.rookMoved = this.rookStatus(
              this.currentPlayer == "white" ? 63 : 56
            )
              ? false
              : true;

            //queen side rook
            this.castleInfo.queenSide.rookMoved = this.rookStatus(
              this.currentPlayer == "white" ? 56 : 63,
            )
              ? false
              : true;

            //if kingside rook is not moved and empty squares between king and rook and those squares are not attacked, then can castle king side
            this.castleInfo.kingSide.save = this.checkEmptySquares(
              this.currentPlayer == "white" ? 63 : 56,
            );
            if (
              !this.castleInfo.kingSide.rookMoved &&
              this.castleInfo.kingSide.save
            ) {
              this.castleInfo.kingSide.kingIdx =
                this.currentPlayer == "white" ? 62 : 57;
              this.castleInfo.kingSide.rookIdx =
                this.currentPlayer == "white" ? 61 : 58;
              this.activeClickValidMoves.push(this.castleInfo.kingSide.kingIdx);
            }
            //if queenside rook is not moved and empty squares between king and rook and those squares are not attacked, then can castle queen side
            this.castleInfo.queenSide.save = this.checkEmptySquares(
              this.currentPlayer == "white" ? 56 : 63,
            );
            if (
              !this.castleInfo.queenSide.rookMoved &&
              this.castleInfo.queenSide.save
            ) {
              this.castleInfo.queenSide.kingIdx =
                this.currentPlayer == "white" ? 58 : 61;
              this.castleInfo.queenSide.rookIdx =
                this.currentPlayer == "white" ? 59 : 60;
              this.activeClickValidMoves.push(
                this.castleInfo.queenSide.kingIdx,
              );
            }
          }
          console.log(this.castleInfo)

        }
    }

    dragAndDropFunctionality(){
        this.squares.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                
                if (block.getAttribute('draggable') == 'false') 
                    return;
                this.selectPiece(block);

                if(this.activeClickTakeMoves.length== 0 && this.activeClickValidMoves.length== 0) 
                    return;
                
                if (this.checkBind()) return; //if pinned, return and dont show any moves
                this.captureOrBlock(); 
                this.addCastleMoves();
                this.updateSelectionMessage();

                if (this.activeClickValidMoves.length === 0 && this.activeClickTakeMoves.length === 0)
                    return;
                
                this.activeClickValidMoves.forEach((moveIndex) => {
                    const targetSquare = this.squares[moveIndex];
                    const isCastleMove = this.selectedPiece.piece== 'king' && (this.castleInfo.kingSide.kingIdx== moveIndex || this.castleInfo.queenSide.kingIdx== moveIndex);
                    if (this.activeClickTakeMoves.includes(moveIndex)) {
                        targetSquare.classList.add("capture-target");
                    } else if(isCastleMove){
                        targetSquare.classList.add("castle");
                    }
                    else 
                        targetSquare.classList.add("drop-target");
                });
               
                e.dataTransfer.setData('text/plain', this.selectedSquare.dataset.index);
                e.dataTransfer.effectAllowed = 'move';               
                
            });

            block.addEventListener('dragend', () => {
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
                //if drop on invalid square, do nothing
                if(!this.activeClickValidMoves.includes(Number(block.dataset.index))) {
                    block.classList.remove('wrong-drop-target');
                    //this.clearSelection();
                    return;
                }

                const droppedIndex = Number(block.dataset.index);
                const isCastleMove = this.selectedPiece?.piece == 'king' && (droppedIndex === this.castleInfo.kingSide.kingIdx || droppedIndex === this.castleInfo.queenSide.kingIdx);
                if(isCastleMove){
                    const castleSide = droppedIndex === this.castleInfo.kingSide.kingIdx ? 'king' : 'queen';
                    const currentColor = this.currentPlayer;
                    this.castle(this.selectedSquare, block);
                    this.fillGameMsg('Castled', `${currentColor} castled ${castleSide} side`);
                } else
                    this.movePiece(this.selectedSquare, block);

                this.resetCheck();
                this.check= Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer== 'white'? 'black': 'white'); //update check info after move
                if(this.check.at != null) this.markCheck(this.check);
                this.clearSelection();
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
                        this.clearSelection();
                        selectPiece(square);  
                        return;
                    }
                    // If capture square
                    if(this.activeClickValidMoves.includes(Number(square.dataset.index))){
                        return;
                    }
                    if(square.getAttribute('draggable') === 'false'){
                        this.clearSelection();
                        return;
                    }
                    
                }else {
                    // Select the piece
                    selectPiece(square);
                }
            });
        });
        const selectPiece = (square) => {

            this.selectPiece(square) //set selected sq etc
            
            if (this.checkBind()) return; //if pinned, return and dont show any moves
            this.captureOrBlock(); 
            this.addCastleMoves();
            this.updateSelectionMessage();

            if(this.activeClickTakeMoves.length== 0 && this.activeClickValidMoves.length== 0) return;
            
            // Add drop-target class and handlers to valid moves
            this.activeClickValidMoves.forEach((moveIndex) => {
                const targetSquare = this.squares[moveIndex];
                const isCastleMove = this.selectedPiece.piece== 'king' && (this.castleInfo.kingSide.kingIdx== moveIndex || this.castleInfo.queenSide.kingIdx== moveIndex);
                if (this.activeClickTakeMoves.includes(moveIndex)) {
                    targetSquare.classList.add("capture-target");
                }
                else if(isCastleMove){
                    targetSquare.classList.add("castle");
                }
                else 
                    targetSquare.classList.add("drop-target");
                
                if(isCastleMove){
                    const handler = () => {
                        const castleSide = moveIndex === this.castleInfo.kingSide.kingIdx ? 'king' : 'queen';
                        const currentColor = this.currentPlayer;
                        this.castle(this.selectedSquare, targetSquare);
                        this.resetCheck();
                        //if(this.kingChecks(this.selectedPiece)) this.markCheck(this.check);
                        this.check= Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer== 'white'? 'black': 'white'); //update check info after move
                        if(this.check.at != null) this.markCheck(this.check);
                        this.clearSelection();
                        this.fillGameMsg('Castled', `${currentColor} castled ${castleSide} side`);
                        this.changeTurn();
                    }
                    targetSquare.addEventListener("click", handler);
                    this.activeMoveHandlers.push({ element: targetSquare, handler });
                    const sides = [];
                    if(this.castleInfo.kingSide.save) sides.push('king');
                    if(this.castleInfo.queenSide.save) sides.push('queen');
                    this.fillGameMsg('', `You can castle on ${sides.join(' or ')} side${sides.length > 1 ? 's' : ''}`);
                }else{

                    const handler = () => {
                        this.movePiece(this.selectedSquare, targetSquare);
                        this.resetCheck();
                        //if(this.kingChecks(this.selectedPiece)) this.markCheck(this.check);
                        this.check= Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer== 'white'? 'black': 'white'); //update check info after move
                        console.log('check info after move', this.check)
                        if(this.check.at != null) {
                            this.markCheck(this.check);
                            //return
                        }
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
