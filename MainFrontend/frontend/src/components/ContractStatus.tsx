import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDEXStore } from '@/store/dex-store';
import { AlertCircle, CheckCircle, Info, ExternalLink, Shield, Settings } from 'lucide-react';

const ContractStatus = () => {
  const { isConnected, isContractDeployed, checkContractDeployment } = useDEXStore();

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="w-full card-glass border-border/20 h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center">
          <Shield className="h-3 w-3 mr-1 text-blue-400" />
          Contract Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center space-x-2 p-2 rounded bg-accent/20">
          {isContractDeployed ? (
            <>
              <CheckCircle className="h-3 w-3 text-green-500" />
              <div className="flex-1">
                <p className="text-xs font-medium text-green-600">Deployed</p>
              </div>
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 text-yellow-500" />
              <div className="flex-1">
                <p className="text-xs font-medium text-yellow-600">Not Deployed</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Inactive
              </Badge>
            </>
          )}
        </div>

        {!isContractDeployed && (
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={checkContractDeployment}
              className="text-xs h-5 px-2"
            >
              <Settings className="h-2 w-2 mr-1" />
              Check
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Contract deployment instructions:');
                console.log('1. Deploy OrderBookDEX contract to Monad testnet');
                console.log('2. Update contract address in config/network.ts');
                console.log('3. Refresh the page');
              }}
              className="text-xs h-5 px-2"
            >
              <ExternalLink className="h-2 w-2 mr-1" />
              Help
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractStatus; 