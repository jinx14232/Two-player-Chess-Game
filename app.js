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

        this.flipped= false;
    
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

        this.lastMove= {
            from: null,
            to: null
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
            this.check.at= 63- this.check.at;
            // this.check.at= flipBoard.indexOf(this.boardPieces[this.check.at]);
            this.markCheck(this.check);
        }

        if(this.lastMove.from != null){
            this.lastMove.from = 63- this.lastMove.from;
            this.lastMove.to = 63- this.lastMove.to;
        }

        this.flipped= !this.flipped;
        this.boardPieces= flipBoard;
    }
    
    renderBoard(){ 
    this.boardPieces.forEach((piece, idx) => {

        const square = this.squares[idx];
        square.innerHTML = '';
        square.className = 'square';

        const row = Math.floor((63 - idx) / 8) + 1;
        if(row % 2 === 0){
            square.classList.add(idx % 2 == 0 ? 'light' : 'dark');
        } else {
            square.classList.add(idx % 2 == 0 ? 'dark' : 'light');
        }

        if(piece){
            if(piece.color === this.currentPlayer){
                square.innerHTML = piece.currentSvg;
                square.firstChild.classList.add(piece.color === 'white' ? 'black-outline' : 'white-outline');
            }else 
                square.innerHTML = piece.svg;

            square.setAttribute('draggable', piece.color === this.currentPlayer ? 'true' : 'false');
            piece.color === 'white' ? square.firstChild.classList.add('white') : square.firstChild.classList.add('black');
            
        } else {
            square.setAttribute('draggable', 'false');
        }
    
    });

    if(this.checked && this.check.at != null){
        this.squares[this.check.at].classList.add('check');
    }
    if(this.lastMove.from !== null){
        this.squares[this.lastMove.from].classList.add('selected');
        this.squares[this.lastMove.to].classList.add('dropped');
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
                
                let check = Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer== 'white' ? 'black' : 'white'); //because at this point current player is still the one who promoted, we need to check for check for opposite color
                if (check.at != null) this.markCheck(check);
                
                if(this.checked && this.isCheckMate()){
                    this.fillGameMsg('Checkmate', 'Game over');
                    return;
                }

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
            this.selectedSquare.classList.remove('selected');
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
                if(this.isCheckMate()){
                    this.fillGameMsg('Checkmate', 'Game over');
                    return;
                }
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
        //reset checkmate info  
        this.chckMate.block = false;
        this.chckMate.capture = false;
        this.chckMate.escape = false;

        const blockPositions = Piece.prototype.findBlockPositions(this.check, this.boardPieces);
        const checkerPositions = this.check.by.map(ch => this.boardPieces.indexOf(ch));

        const canCaptureChecker = (takeMoves) => {
            if(this.check.by.length !== 1) return false;
            return checkerPositions.some(pos => takeMoves.includes(pos));
        }

        if(this.check.by.length === 1){
            this.boardPieces.some((chessPiece, i) => {
                if(!chessPiece || chessPiece.color != this.currentPlayer || chessPiece.piece == 'king') return false;

                if(this.isPinned(chessPiece)) return false; //if piece is pinned, it cant block or capture

                const validMoves = chessPiece.validMove(i, this.boardPieces);
                const takeMoves = chessPiece.takeMove(i, this.boardPieces);

                if(!this.chckMate.block && blockPositions.length > 0){
                    if(validMoves.some(pos => blockPositions.includes(pos))){
                        this.chckMate.block = true;
                    }
                }
                if(!this.chckMate.capture && canCaptureChecker(takeMoves)){
                    this.chckMate.capture = true;
                }

                return this.chckMate.block && this.chckMate.capture;
            });
        }

        if(this.activeClickValidMoves.length == 0)
                this.chckMate.escape = false;
        
        return !this.chckMate.block && !this.chckMate.capture && !this.chckMate.escape;
    }

    
    selectPiece(block) {

        if(this.selectedSquare) this.clearSelection();
        this.resetCastleInfo();

        if(this.lastMove.from !== null){
            this.squares[this.lastMove.from].classList.remove('selected');
            this.squares[this.lastMove.to].classList.remove('dropped');
            this.lastMove = { from: null, to: null };
        }

        this.selectedSquare = block;
        this.selectedIndex= Number(this.selectedSquare.dataset.index)
        this.selectedPiece= this.boardPieces[this.selectedIndex];
        this.selectedSquare.classList.add('selected');

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
            target.classList.add('dropped');
            source.innerHTML = '';

            this.selectedPiece= this.boardPieces[targetIndex]

            this.lastMove = { from: sourceIndex, to: targetIndex };

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
        // this.boardPieces.some(piece=>{
        //     if(!piece || piece.color== this.currentPlayer) return;
        //     let validMoves= piece.validMove(this.boardPieces.indexOf(piece), this.boardPieces);
        //     validMoves.some(move=>{
        //         if(emptySqrs.includes(move)){
        //             allow= false;
        //             return true;
        //         }
        //     })
        //     if(!allow) return true;
        // })
        emptySqrs.some(sq=>{
            let attacked= Piece.prototype.underAttack(sq, this.boardPieces, this.currentPlayer);
            if(attacked){
                allow= false;
                return true;
            }
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

        this.lastMove = { from: kingIdx, to: targetIndex };
        
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
        if (this.selectedPiece.piece!= 'king') {

            if(this.activeClickValidMoves.length == 0) return false;
            const piece= this.selectedPiece;
            if (this.isPinned(piece)) {
                this.pinned= true;
                this.selectedSquare.classList.add('bind');
                this.fillGameMsg('Pinned!', `Can not move this ${this.selectedPiece.piece}`)
                this.clearClickSelection();
                return true; //pinned, all moves expose check
            }else{
                this.clearMsg();
                return false;
            }
        }
        return false;
    }
    isPinned(piece) {

        //internally placing that piece over its valid moves and filter those moves which are save
        // this.activeClickValidMoves= this.activeClickValidMoves.filter(move => {
            
        //     let orgPiece = this.boardPieces[move]; 
        //     this.boardPieces[move] = this.selectedPiece;
        //     this.boardPieces[this.selectedIndex]= null;
            
        //     //return pieces that check king
        //     let check = Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer);
        //     if (check.at != null && check.by.length > 0 && check.by[0].color !== this.currentPlayer) {
        //         this.boardPieces[move]= orgPiece;
        //         return false; //move is not save, it exposes check
        //     }else{
        //         this.boardPieces[move]= orgPiece;
        //         return move; //move is save, it doesn't expose check
        //     }
        // })
        const pieceIdx= this.boardPieces.indexOf(piece);
        //internally removing the piece
        this.boardPieces[pieceIdx]= null;
        //see if king is in check without that piece
        let check = Piece.prototype.checkPin(this.boardPieces, 'king', this.currentPlayer);
        this.boardPieces[pieceIdx]= piece; //put the piece back
        
        if(check) return true; //pinned, all moves expose check
        
        return false; //not pinned, there are moves that dont expose check
    }
    //  blockCheckerPos(){        
    //     let blockPositions = Piece.prototype.findBlockPositions(this.check, this.boardPieces);
    //     if(blockPositions.length== 0) return null;

    //     this.activeClickValidMoves = this.activeClickValidMoves.filter(move => 
    //         blockPositions.includes(move)
    //     );

    //     if(this.activeClickValidMoves.length== 0) return null;
    //     return true;
    // }

    captureOrBlock(){
        if(this.checked && this.selectedPiece.piece != 'king'){

            if(this.check.by.length > 1){ //if double check, only king can move, so no need to show valid moves for other pieces
                this.activeClickValidMoves = [];
                this.activeClickTakeMoves = [];
                this.selectedPiece.targetPositions = [];
                this.selectedPiece.takePositions = [];
                return;
            }

            const checkerPos = this.boardPieces.indexOf(this.check.by[0]);
            const canCaptureChecker = this.activeClickTakeMoves.includes(checkerPos);
            const blockPositions = Piece.prototype.findBlockPositions(this.check, this.boardPieces);

            if(canCaptureChecker){
                this.activeClickTakeMoves = [checkerPos];
                this.selectedPiece.takePositions = [checkerPos];
            } else {
                this.activeClickTakeMoves = [];
                this.selectedPiece.takePositions = [];
            }

            if(blockPositions.length > 0){ 
                this.activeClickValidMoves = this.activeClickValidMoves.filter(move => blockPositions.includes(move));
            } else {
                this.activeClickValidMoves = [];
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
            if(!this.castleInfo.kingSide.rookMoved) this.castleInfo.kingSide.save = this.checkEmptySquares(this.currentPlayer == "white" ? 63 : 56,);
            else this.castleInfo.kingSide.save= false;

            if (!this.castleInfo.kingSide.rookMoved && this.castleInfo.kingSide.save) {
                this.castleInfo.kingSide.kingIdx = this.currentPlayer == "white" ? 62 : 57;
                this.castleInfo.kingSide.rookIdx = this.currentPlayer == "white" ? 61 : 58;
                
                this.activeClickValidMoves.push(this.castleInfo.kingSide.kingIdx);
                this.selectedPiece.targetPositions.push(this.castleInfo.kingSide.kingIdx);
            }
            //if queenside rook is not moved and empty squares between king and rook and those squares are not attacked, then can castle queen side
            if(!this.castleInfo.queenSide.rookMoved) this.castleInfo.queenSide.save = this.checkEmptySquares(this.currentPlayer == "white" ? 56 : 63,);
            else this.castleInfo.queenSide.save= false;

            if (!this.castleInfo.queenSide.rookMoved && this.castleInfo.queenSide.save) {
                this.castleInfo.queenSide.kingIdx = this.currentPlayer == "white" ? 58 : 61;
                this.castleInfo.queenSide.rookIdx = this.currentPlayer == "white" ? 59 : 60;
                this.activeClickValidMoves.push(this.castleInfo.queenSide.kingIdx,);
                this.selectedPiece.targetPositions.push(this.castleInfo.queenSide.kingIdx);
            }
          
        }
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
                if(this.checked && this.isCheckMate()){
                    this.fillGameMsg('Checkmate', 'Game over');
                }

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

                        this.check= Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer== 'white'? 'black': 'white'); //update check info after move
                        if(this.check.at != null) this.markCheck(this.check);
                        
                        this.clearSelection();
                        this.fillGameMsg('Castled', `${currentColor} castled ${castleSide} side`);
                        
                        if(this.checked && this.isCheckMate()){
                            this.fillGameMsg('Checkmate', 'Game over');
                            return;
                        }

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

                        this.check= Piece.prototype.checkForCheck(this.boardPieces, 'king', this.currentPlayer== 'white'? 'black': 'white'); //update check info after move
                        if(this.check.at != null) {
                            this.markCheck(this.check);
                            //return
                        }
                        console.log(this.check);

                        this.clearSelection();
                        if(this.checked && this.isCheckMate()){
                            this.fillGameMsg('Checkmate', 'Game over');
                            return;
                        }

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
