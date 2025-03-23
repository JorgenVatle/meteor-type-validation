import { Meteor } from 'meteor/meteor';
import * as v from 'valibot';
import { UserGuard } from '../../src';
import { defineGuard } from '../../src/server/guards/defineGuard';

type ProductPermission = 'products:view' | 'products:edit';

function hasPermission(user: Meteor.User, permission: ProductPermission) {
    return true;
}

export function requireProductPermission<TPermission extends ProductPermission>(permission: TPermission) {
    return defineGuard({
        writeToParams: false,
        writeToContext: false,
        paramSchema: [
            v.object({
                productId: v.string(),
            })
        ],
        contextSchema: v.pipeAsync(
            UserGuard.contextSchema,
            v.checkAsync(async (input) => {
                const awaitedInput = await input;
                return hasPermission(awaitedInput.user, permission);
            })
        )
    })
}