// Budget Controller
var budgetController = (function(){
    
    // Some code
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
        
        
    };
    
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;
        
        });
        data.totals[type] = sum;
        
    };
    
    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage: -1
    };
    
    return {
        addItems: function(type,desc,val){
            var newItem, ID;
            
            //[1 2 3 4 5] next Id = 6
            //[1 2 4 6 8] next id = 9
            // ID = last ID + 1
            
            // Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }
            else{
                ID = 0;
            }
            
            
            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, desc, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, desc, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        deleteItem : function(type, id){
            
            var ids, index;
            
            // id = 6
            // ids = [1 2 4 6 8]
            // index = 3
            
            // Map is similar to Foreach
            // Difference is map returns a brand new array
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index!== -1){
                data.allItems[type].splice(index, 1);
            }
            
            
        },
        
        calculateBudget : function(){
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            
            // calculate the expense percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
            
                        
        },
        
        calculatePercentages: function(){
            /*
            a = 20
            b = 10
            c = 40
            inc = 100
            a = 20/100 = 20%
            b = 10/100 = 10%
            c = 40/100 = 40%
            */
            data.allItems.exp.forEach(function(cur){
                
                cur.calculatePercentage(data.totals.inc);
                
            });
            
            
        },
        
        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return  cur.getPercentage(); 
            });
            return allPerc;
        },
        
        getBudget: function(){
            
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },
        
        testing : function(){
            console.log(data);
        }
    }
    
    
})();


// UI Controller
var UIController = (function(){
    // 
    
    var DOMstring = {
        inputType:'.add__type',
        inputDescription : '.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expenseContainer:'.expenses__list',
        budgetLabel : '.budget__value',
        incomeLable : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel : '.budget__title--month'


    };
    var formatNumber = function(num, type){
            var numSplit, int, dec, sign;
            
            /*
            + or - before the number
            exactly two decimal points
            comma separating the thousands
            
            */
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length -3) + ',' + int.substr(int.length-3, 3);
            }
                        
            dec = numSplit[1];
            
            type === 'exp' ? sign = '-' : sign = '+';
            
            return (type === 'exp' ?  '-' : '+') + ' ' + int + '.' +dec;
            
            
    };
    
    var nodeListForEach = function(list,callback){
        for(var i = 0; i< list.length; i++){
            callback(list[i],i);
        }
    };
    
    return {
        getInput: function(){
            
            return {
                type: document.querySelector(DOMstring.inputType).value,
                // will be either inc or exp
                description : document.querySelector(DOMstring.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstring.inputValue).value)
            };
        },
        
        addListItem : function(obj, type){
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            
            if(type === 'inc'){
                element = DOMstring.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMstring.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

            
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
            
            
        },
        
        deleteListItem : function(selectorID){
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
            
        },
        
        clearFields : function(){
            
            var fields, fieldsArr;
            
            // Query selector all returns a list
            fields = document.querySelectorAll(DOMstring.inputDescription + ',' + DOMstring.inputValue);
            
            // this tricks the slice method to think, we have passed a array instead of a list
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
                //current.description = "";
            });
            
            fieldsArr[0].focus();
            
        },
        
        displayBudget : function(obj){
            var type;
           obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type);
           document.querySelector(DOMstring.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if(obj.percentage > 0){
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMstring.percentageLabel).textContent = '---';
            }
            
            
        },
        
        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMstring.expensesPercentageLabel);
            
                        
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index]  > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
                
            });
             
            
        },
        
        displayMonth : function(){
          
            var now, month, months, year;
            now = new Date();
            
            months = ['January','February','March','April','May','June','July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' '+ year;
            
        },
        
        changedType : function(){
            
            var fields = document.querySelectorAll(
                DOMstring.inputType + ',' + DOMstring.inputDescription + ',' + DOMstring.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstring.inputBtn).classList.toggle('red');
            
        },
        
        getDOMStrings : function(){
            return DOMstring;
        }
    };
    
})();


// Global app Controller
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        
        document.addEventListener('keypress',function(event){
            // event.which is for older browser which may not have keycode property
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }

        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    };
    
    
    
    var updateBudget = function(){
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
                
        // 3. Display the budget to the UI
        UICtrl.displayBudget(budget);
        
        
    };
    
    var updatePercentages = function(){
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
        
        // 3. Update the Ui with the new percentages
        UICtrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function(){        
        var input, newItem;
        // 1. Get the filled inpput data
        input = UICtrl.getInput();
        
        // We want this to happen if the fields have any value
        if(input.description !== "" && !isNaN(input.value) && input.value > 0 ){
            
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItems(input.type,input.description,input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget(); 
            
            // 6. Calculate and update the percentages
            updatePercentages();

        }
      
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, type, splitID, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from our data sctructure
            budgetCtrl.deleteItem(type,ID);
            
            // 2. Delete the item from UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget(); 
            
            // 4. Calculate and update the percentages
            updatePercentages();
            
        }
        
    };
    
    
    return{
        init: function(){
            console.log('Application has started.');
            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setupEventListeners();
            UICtrl.displayMonth();
        }
    };

    
})(budgetController,UIController);

controller.init();







