import { useSQLiteContext } from "expo-sqlite/next";

export type GoalCreateDatabase = {
    name: string
    total: number
}

export type GoalDatabase = {
    id: number
    name: string
    total: number
    current: number
}

export function useGoalsRepository() {
    const database = useSQLiteContext()

    function create(goal: GoalCreateDatabase) {
        try {
            const statement = database.prepareSync("INSERT INTO goals (name, total) VALUES ($name, $total)")

            statement.executeAsync({
                $name: goal.name,
                $total: goal.total
            })
        } catch (error) {
            throw error
        }
    }

    function all() {
        try {
            return database.getAllSync<GoalDatabase>(`
                SELECT g.id, g.name, g.total, COALESCE(SUM(t.amount), 0) AS current
                FROM goals g
                LEFT JOIN transactions t ON t.goal_id = g.id   
                GROUP BY g.id, g.name, g.total;
            `)
        } catch (error) {
            throw error
        }
    }

    function show(id : number) {
        const statement = database.prepareSync(`
                SELECT g.id, g.name, g.total, COALESCE(SUM(t.amount), 0) AS current
                FROM goals g
                LEFT JOIN transactions t ON t.goal_id = g.id   
                WHERE g.id = $id
                GROUP BY g.id, g.name, g.total;
        `)
        const result = statement.executeSync<GoalDatabase>({ $id: id })
        return result.getFirstSync()
    }
    return {
        create,
        all,
        show,
    }
}