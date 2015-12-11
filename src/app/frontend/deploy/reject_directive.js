
//TODO(cheld) could be reused? Implement in different way? Does make sense? We need proper server error handling anyay...
export default function() {
    return {
        scope:{
          reject: '=',
        },
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.reject = function(modelValue) {
                if(scope.reject.indexOf(modelValue) >= 0){
                  return false;
                }
                return true;
            };
        },
    };
}
