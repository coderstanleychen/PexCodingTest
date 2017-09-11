const Immutable = require('immutable');



const errors = Immutable.fromJS({
    name: ['This field is required'],
    age: ['This field is required', 'Only numeric characters are allowed'],
    urls: [{}, {}, {
      site: {
        code: ['This site code is invalid'],
        id: ['Unsupported id'],
      }
    }],
    url: {
      site: {
        code: ['This site code is invalid'],
        id: ['Unsupported id'],
      }
    },
    tags: [{}, {
      non_field_errors: ['Only alphanumeric characters are allowed'],
      another_error: ['Only alphanumeric characters are allowed'],
      third_error: ['Third error']
    }, {}, {
      non_field_errors: [
        'Minumum length of 10 characters is required',
        'Only alphanumeric characters are allowed',
      ],
    }],
    tag: {
      nested: {
        non_field_errors: ['Only alphanumeric characters are allowed'],
      },
    },
  });



let arr_error_content = [];
let key_indicator = -1;

// Extract all error message with level 1 key name, and store them in an array
function loopMap(inputMap, originInputMap){
  inputMap.entrySeq().forEach((e) => {
    if (originInputMap.get(e[0]) !== undefined) {
      key_indicator++; 
    }
    if(!Immutable.Map.isMap(e[1])) {
      e[1].forEach((arrElement) => {
        if(Immutable.Map.isMap(arrElement)) {
          return loopMap(arrElement, originInputMap);
        } else {
          arr_error_content.push(key_indicator + " " + ": " + arrElement + ".");
          return;
        }
      });
    } else {       
      return loopMap(e[1], originInputMap);
    }
  });
}


// Delete duplicates from the array, which is a error message container
function uniq(a) {
   return Array.from(new Set(a));
}


// 
function resetParameters() {
  arr_error_content = [];
  key_indicator = -1;
}


function getErrorContent(inputMap) {
   let arr_error_content = [];
   let key_indicator = -1;




  loopMap(inputMap, inputMap);
  arr_error_content = uniq(arr_error_content);
  return arr_error_content;
}


function resetMap(inputMap, keyArr){
  inputMap.keySeq().forEach((key) => {
    if(keyArr.indexOf(key) == -1) {
      inputMap = inputMap.set(key, '');
    }    
  });
  return inputMap;
}


function transformErrors(inputMap, keyArr) {
  let resettedErrors = resetMap(inputMap, keyArr);
  let errorContents = getErrorContent(inputMap)
  errorContents.forEach((element) => {
    let currKeyIndex = Number(element.substring(0, element.indexOf(" ")));
    let currKey = Array.from(errors.keys())[currKeyIndex];
    let currErrorContent = element.substring(element.indexOf(":") + 2);
    if(keyArr.indexOf(currKey) == -1) {
      resettedErrors = resettedErrors.set(currKey, resettedErrors.get(currKey).concat(currErrorContent, " "));  
    } 
  });
  
  stringified_resettedErrors = JSON.stringify(resettedErrors);
  stringified_resettedErrors = stringified_resettedErrors.replace(/\["/g, '"');
  stringified_resettedErrors = stringified_resettedErrors.replace(/"]/g, '."');

  let errors_final = Immutable.fromJS(JSON.parse(stringified_resettedErrors));
  return errors_final;
}


console.log(transformErrors(errors, ['urls', 'url']));
console.log(transformErrors(errors, []));



